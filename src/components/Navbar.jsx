import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SettingsDialog from "./SettingsDialog";

/**
 * Top application bar shown on the Dashboard.
 * Shows hamburger toggle (for sidebar), app title, and user avatar menu.
 */
const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleOpenSettings = () => {
    handleCloseMenu();
    setSettingsOpen(true);
  };

  const handleLogout = () => {
    handleCloseMenu();
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Generate initials from user name for avatar
  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "linear-gradient(90deg, #1a237e 0%, #283593 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Toolbar sx={{ px: { xs: 1, sm: 3 } }}>
          {/* Sidebar toggle */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={onToggleSidebar}
            sx={{ mr: 2 }}
            aria-label="toggle sidebar"
          >
            <MenuIcon />
          </IconButton>

          {/* App title */}
          <Typography
            variant="h6"
            noWrap
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              letterSpacing: 1,
              background: "linear-gradient(90deg,#90caf9,#e3f2fd)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Zucitech
          </Typography>

          {/* User greeting (hidden on xs) */}
          <Typography
            variant="body2"
            sx={{
              mr: 2,
              color: "rgba(255,255,255,0.75)",
              display: { xs: "none", sm: "block" },
            }}
          >
            Hi, {user?.username || user?.email || "User"}
          </Typography>

          {/* Avatar / user menu */}
          <Tooltip title="Account options">
            <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
              <Avatar
                src={
                  user?.photoUrl
                    ? `http://localhost:8080/${user.photoUrl}`
                    : undefined
                }
                sx={{
                  bgcolor: "#42a5f5",
                  width: 38,
                  height: 38,
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                {!user?.photoUrl && getInitials(user?.username || user?.email)}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 180,
                borderRadius: 2,
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              },
            }}
          >
            <MenuItem disabled>
              <ListItemIcon>
                <AccountCircleIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="body2" noWrap>
                {user?.username || user?.email}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleOpenSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: "#1976d2" }} />
              </ListItemIcon>
              <Typography variant="body2">Settings</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" color="error" />
              </ListItemIcon>
              <Typography variant="body2" color="error">
                Logout
              </Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
};

export default Navbar;
