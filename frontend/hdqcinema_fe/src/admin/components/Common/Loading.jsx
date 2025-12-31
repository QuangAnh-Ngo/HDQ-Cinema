import "../../styles/AdminLayout.scss";

const Loading = ({ size = "medium", text = "Đang tải..." }) => {
  return (
    <div className={`loading ${size}`}>
      <div className="spinner"></div>
      {text && <p>{text}</p>}
    </div>
  );
};

export default Loading;
