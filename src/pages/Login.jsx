import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginUser, getMyProfile } from "../services/api";
import FormInput from "../components/FormInput";
import ForgotPasswordDialog from "../components/forgotPassword/ForgotPasswordDialog";
import toast from "react-hot-toast";

// High-quality Unsplash background for the image panel
const BG_IMAGE =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80";

/**
 * Login page – contains email/password form, "Remember Me" checkbox,
 * validation, loading state, and a link to the Register page.
 */
const Login = () => {
  const { login, updateUserData } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  // Forgot password dialog
  const [forgotOpen, setForgotOpen] = useState(false);
  const handleForgotOpen = () => setForgotOpen(true);

  // Controlled input handler
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  // Client-side validation
  const validate = () => {
    const newErrors = {};
    if (!form.usernameOrEmail.trim())
      newErrors.usernameOrEmail = "Username or email is required";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Minimum 6 characters";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await loginUser({
        usernameOrEmail: form.usernameOrEmail,
        password: form.password,
      });
      const data = response.data;

      const ok = login(data);
      if (!ok) {
        throw new Error(
          "Server returned an incomplete response. Please try again.",
        );
      }

      // Fetch full profile to get the user's id (not always in login response)
      try {
        const profileRes = await getMyProfile();
        const profile = profileRes.data;
        updateUserData({
          id: profile.id,
          photoUrl: profile.photoUrl,
          firstName: profile.firstName,
          lastName: profile.lastName,
        });
      } catch {
        // Non-fatal: id won't be available until next login if this fails
      }

      toast.success(`Welcome back, ${data.username || data.email}!`);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Box
      sx={{
        minHeight: "100vh",
        overflowY: "auto",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${BG_IMAGE})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        px: 2,
        py: 4,
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(160deg, rgba(13,23,77,0.72) 0%, rgba(1,39,86,0.80) 60%, rgba(0,16,54,0.88) 100%)",
          zIndex: 0,
        },
      }}
    >
      {/* ── DECORATIVE OVERLAY ELEMENTS (desktop only) ── */}
      {isDesktop && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          {/* Top-left stat badges */}
          <Box
            sx={{
              position: "absolute",
              top: 40,
              left: 48,
              display: "flex",
              gap: 2,
            }}
          >
            {[
              { label: "Timesheets", value: "1,240" },
              { label: "Teams", value: "34" },
              { label: "Approved", value: "98%" },
            ].map((stat) => (
              <Box
                key={stat.label}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 3,
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  textAlign: "center",
                  minWidth: 90,
                  boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ color: "#fff", lineHeight: 1.2 }}
                >
                  {stat.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Top-right logo */}
          <Box
            sx={{
              position: "absolute",
              top: 44,
              right: 48,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <AccessTimeIcon sx={{ color: "#90caf9", fontSize: 28 }} />
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: "#e3f2fd", letterSpacing: 1 }}
            >
              Zucitech
            </Typography>
          </Box>

          {/* Bottom-left tagline */}
          <Box
            sx={{ position: "absolute", bottom: 48, left: 48, maxWidth: 480 }}
          >
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: "#fff", lineHeight: 1.25, mb: 1 }}
            >
              Manage your time,{" "}
              <Box component="span" sx={{ color: "#90caf9" }}>
                effortlessly.
              </Box>
            </Typography>
            {[
              "One-click timesheet submission",
              "Real-time approval tracking",
              "Team & project insights",
            ].map((f) => (
              <Box
                key={f}
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75 }}
              >
                <CheckCircleOutlineIcon
                  sx={{ color: "#42a5f5", fontSize: 16 }}
                />
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.8)" }}
                >
                  {f}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ── CENTERED FORM CARD ── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
          backdropFilter: "blur(20px)",
          background: "rgba(13,27,75,0.80)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
          p: { xs: 3, sm: 4 },
          color: "#fff",
        }}
      >
        {/* Mobile logo */}
        {!isDesktop && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 3,
            }}
          >
            <AccessTimeIcon sx={{ color: "#90caf9", fontSize: 28 }} />
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ color: "#e3f2fd", letterSpacing: 1 }}
            >
              Zucitech
            </Typography>
          </Box>
        )}

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg,#42a5f5,#1565c0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1.5,
              boxShadow: "0 4px 20px rgba(66,165,245,0.4)",
            }}
          >
            <LockOutlinedIcon sx={{ color: "#fff", fontSize: 24 }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{ color: "#fff", letterSpacing: 0.5 }}
          >
            Sign In
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.6)", mt: 0.25 }}
          >
            Access your Zucitech account
          </Typography>
        </Box>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {serverError}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <FormInput
            label="Username or Email"
            name="usernameOrEmail"
            value={form.usernameOrEmail}
            onChange={handleChange}
            type="text"
            error={errors.usernameOrEmail}
            autoComplete="username"
            required
          />
          <FormInput
            label="Password"
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            error={errors.password}
            autoComplete="current-password"
            required
          />

          {/* Forgot password */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Typography
              component="span"
              variant="body2"
              onClick={handleForgotOpen}
              sx={{
                color: "#42a5f5",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { textDecoration: "underline", color: "#90caf9" },
                cursor: "pointer",
              }}
            >
              Forgot password?
            </Typography>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: 0.5,
              background: "linear-gradient(90deg,#1976d2,#42a5f5)",
              boxShadow: "0 4px 20px rgba(25,118,210,0.45)",
              "&:hover": {
                background: "linear-gradient(90deg,#1565c0,#2196f3)",
                boxShadow: "0 6px 28px rgba(25,118,210,0.55)",
              },
              transition: "all 0.25s ease",
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>
      </Box>

      {/* ── Forgot Password Dialog ── */}
      <ForgotPasswordDialog
        open={forgotOpen}
        onClose={() => setForgotOpen(false)}
      />
    </Box>
  );
};

export default Login;
