import { FiAlertTriangle } from "react-icons/fi";
import "../../styles/AdminLayout.scss";

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  type = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="dialog">
        <div className="dialog-header">
          <div className={`icon ${type}`}>
            <FiAlertTriangle size={24} />
          </div>
          <div className="content">
            <h3>{title}</h3>
            <p>{message}</p>
          </div>
        </div>

        <div className="dialog-actions">
          <button className="cancel" onClick={onClose}>
            Hủy
          </button>
          <button
            className={`confirm ${type}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
