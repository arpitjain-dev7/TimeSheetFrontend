import { Dialog } from "@mui/material";
import useForgotPassword from "../../hooks/useForgotPassword";
import StepRequestOtp from "./StepRequestOtp";
import StepVerifyOtp from "./StepVerifyOtp";
import StepResetPassword from "./StepResetPassword";
import StepSuccess from "./StepSuccess";

const ForgotPasswordDialog = ({ open, onClose }) => {
  const fp = useForgotPassword();

  const handleClose = () => {
    fp.reset();
    onClose();
  };

  const renderStep = () => {
    switch (fp.step) {
      case 1:
        return (
          <StepRequestOtp
            loading={fp.loading}
            error={fp.error}
            clearError={fp.clearError}
            onSubmit={fp.requestOtp}
            onClose={handleClose}
          />
        );
      case 2:
        return (
          <StepVerifyOtp
            email={fp.email}
            loading={fp.loading}
            error={fp.error}
            otpExpired={fp.otpExpired}
            resendKey={fp.resendKey}
            clearError={fp.clearError}
            onSubmit={fp.verifyOtp}
            onResend={fp.resendOtp}
            onClose={handleClose}
          />
        );
      case 3:
        return (
          <StepResetPassword
            loading={fp.loading}
            error={fp.error}
            clearError={fp.clearError}
            onSubmit={fp.resetPassword}
            onClose={handleClose}
          />
        );
      case 4:
        return <StepSuccess onClose={handleClose} />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={fp.step === 4 ? handleClose : undefined}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
    >
      {renderStep()}
    </Dialog>
  );
};

export default ForgotPasswordDialog;
