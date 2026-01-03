package com.example.HDQCinema.service;

import com.example.HDQCinema.dto.request.AuthenticationRequest;
import com.example.HDQCinema.dto.request.IntrospectRequest;
import com.example.HDQCinema.dto.request.LogoutRequest;
import com.example.HDQCinema.dto.request.RefreshRequest;
import com.example.HDQCinema.dto.response.AuthenticationResponse;
import com.example.HDQCinema.dto.response.IntrospectResponse;
import com.example.HDQCinema.entity.EmployeeAccount;
import com.example.HDQCinema.entity.InvalidatedToken;
import com.example.HDQCinema.entity.Permission;
import com.example.HDQCinema.entity.Role;
import com.example.HDQCinema.exception.AppException;
import com.example.HDQCinema.exception.ErrorCode;
import com.example.HDQCinema.repository.EmployeeAccountRepository;
import com.example.HDQCinema.repository.InvalidatedTokenRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
//Builder cho phép có construct gồm 3 thuộc tính trong authenticationService => mâu thuẫn với RequiredArgs (chỉ có 1 thuộc tính cho constructor)
public class AuthenticationService {
    EmployeeAccountRepository empployeeAccountRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String JWT_SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    public AuthenticationResponse authenticate(AuthenticationRequest request){
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        EmployeeAccount employeeAccount = empployeeAccountRepository.findByUsername(request.getUsername())
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_FOUND));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), employeeAccount.getPassword());

        if (!authenticated)
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        String token = generateToken(employeeAccount);

        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    public IntrospectResponse introspect(IntrospectRequest request) throws ParseException, JOSEException{
        String token = request.getToken();
        boolean isValid = true;

        try{
            verifyToken(token, false);
        }catch(AppException e){
            isValid = false;
        }

        return IntrospectResponse.builder()
                .valid(isValid)
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException{
        SignedJWT token = verifyToken(request.getToken(), true);

        String jti = token.getJWTClaimsSet().getStringClaim("jti");
        Date expiryTime = token.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jti)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken(), true);

        String jit = signedJWT.getJWTClaimsSet().getJWTID();
        Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();

        invalidatedTokenRepository.save(invalidatedToken);

        String username = signedJWT.getJWTClaimsSet().getSubject();
        var user = empployeeAccountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        var token = generateToken(user);
        return AuthenticationResponse.builder()
                .token(token)
                .build();
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws ParseException, JOSEException {
        JWSVerifier jwsVerifier = new MACVerifier(JWT_SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);
        boolean isVerify = signedJWT.verify(jwsVerifier);

        Date expiryTime = (isRefresh)
                ? new Date(signedJWT
                    .getJWTClaimsSet()
                    .getIssueTime()
                    .toInstant()
                    .plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS)
                    .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        if (!(isVerify && expiryTime.after(new Date())))
            throw new AppException(ErrorCode.UNAUTHENTICATED);


        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new AppException(ErrorCode.UNAUTHENTICATED);

        return signedJWT;
    }

    public String generateToken(EmployeeAccount account){
        //header
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        //payload
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(account.getUsername())
                .issuer("quanh")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()
                ))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(account))
                .build();

        Payload payload = new Payload(claims.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try{
            jwsObject.sign(new MACSigner(JWT_SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        }catch(JOSEException e){
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private String buildScope(EmployeeAccount account){
        StringJoiner stringJoiner = new StringJoiner(" ");

        if (!CollectionUtils.isEmpty(account.getRoles())){
            for (Role role : account.getRoles()){
                stringJoiner.add("ROLE_" + role.getName());

                if (!CollectionUtils.isEmpty(role.getPermissions())){
                    for (Permission permission : role.getPermissions()){
                        stringJoiner.add(permission.getName());
                    }
                }
            }
        }

        return stringJoiner.toString();
    }
}
