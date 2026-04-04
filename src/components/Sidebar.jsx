import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Box,
  Divider,
  Tooltip,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SettingsIcon from "@mui/icons-material/Settings";
import PeopleIcon from "@mui/icons-material/People";
import FolderIcon from "@mui/icons-material/Folder";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED = 72;

const navItems = [
  { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
  {
    label: "Approved",
    icon: <CheckCircleIcon />,
    path: "/manager/timesheets?status=APPROVED",
  },
  {
    label: "Pending",
    icon: <PendingActionsIcon />,
    path: "/manager/timesheets?status=SUBMITTED",
  },
];

/**
 * Collapsible sidebar for the Dashboard layout.
 * On mobile it renders as a temporary overlay drawer.
 * On desktop it collapses to icon-only mode.
 */
const Sidebar = ({ open, onClose, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const isAdmin =
    user?.roles?.includes("ROLE_ADMIN") ||
    user?.roles?.includes("ROLE_MANAGER");

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        background:
          "linear-gradient(180deg, #0d1b4b 0%, #1a237e 60%, #283593 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Logo area */}
      <Toolbar
        sx={{
          minHeight: 64,
          px: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <AccessTimeIcon
          sx={{ color: "#90caf9", fontSize: 28, flexShrink: 0 }}
        />
        {open && (
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              letterSpacing: 1,
              color: "#e3f2fd",
              whiteSpace: "nowrap",
            }}
          >
            TimeSheet Pro
          </Typography>
        )}
      </Toolbar>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

      {/* Navigation list */}
      <List sx={{ mt: 1, px: open ? 1 : 0.5, flexGrow: 1 }}>
        {navItems.map(({ label, icon, path }) => {
          const currentFull = location.pathname + location.search;
          const active =
            currentFull === path ||
            (location.pathname === path && !path.includes("?"));
          return (
            <Tooltip
              key={label}
              title={!open ? label : ""}
              placement="right"
              arrow
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(path);
                    if (isMobile) onClose();
                  }}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: open ? 2 : 1.5,
                    justifyContent: open ? "flex-start" : "center",
                    background: active
                      ? "linear-gradient(90deg,rgba(66,165,245,0.25),rgba(66,165,245,0.08))"
                      : "transparent",
                    borderLeft: active
                      ? "3px solid #42a5f5"
                      : "3px solid transparent",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? "#90caf9" : "rgba(255,255,255,0.65)",
                      minWidth: open ? 40 : "auto",
                      mr: open ? 0 : 0,
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: active ? 700 : 400,
                        color: active ? "#e3f2fd" : "rgba(255,255,255,0.8)",
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}

        {/* User-only: My Timesheets */}
        {!isAdmin &&
          (() => {
            const tsPath = "/timesheets";
            const tsActive = location.pathname.startsWith("/timesheets");
            return (
              <>
                {open && (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      pt: 1.5,
                      pb: 0.5,
                      display: "block",
                      color: "rgba(255,255,255,0.35)",
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      fontSize: 10,
                    }}
                  >
                    Timesheets
                  </Typography>
                )}
                <Tooltip
                  title={!open ? "My Timesheets" : ""}
                  placement="right"
                  arrow
                >
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => {
                        navigate(tsPath);
                        if (isMobile) onClose();
                      }}
                      sx={{
                        borderRadius: 2,
                        py: 1.2,
                        px: open ? 2 : 1.5,
                        justifyContent: open ? "flex-start" : "center",
                        background: tsActive
                          ? "linear-gradient(90deg,rgba(66,165,245,0.25),rgba(66,165,245,0.08))"
                          : "transparent",
                        borderLeft: tsActive
                          ? "3px solid #42a5f5"
                          : "3px solid transparent",
                        "&:hover": {
                          background:
                            "linear-gradient(90deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: tsActive
                            ? "#90caf9"
                            : "rgba(255,255,255,0.65)",
                          minWidth: open ? 40 : "auto",
                        }}
                      >
                        <AssignmentIcon />
                      </ListItemIcon>
                      {open && (
                        <ListItemText
                          primary="My Timesheets"
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: tsActive ? 700 : 400,
                            color: tsActive
                              ? "#e3f2fd"
                              : "rgba(255,255,255,0.8)",
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>
              </>
            );
          })()}

        {/* Admin-only: User Management */}
        {isAdmin &&
          (() => {
            const path = "/user-management";
            const active = location.pathname === path;
            return (
              <>
                {open && (
                  <Typography
                    variant="caption"
                    sx={{
                      px: 2,
                      pt: 1.5,
                      pb: 0.5,
                      display: "block",
                      color: "rgba(255,255,255,0.35)",
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      fontSize: 10,
                    }}
                  >
                    Admin
                  </Typography>
                )}
                <Tooltip
                  title={!open ? "User Management" : ""}
                  placement="right"
                  arrow
                >
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      onClick={() => {
                        navigate(path);
                        if (isMobile) onClose();
                      }}
                      sx={{
                        borderRadius: 2,
                        py: 1.2,
                        px: open ? 2 : 1.5,
                        justifyContent: open ? "flex-start" : "center",
                        background: active
                          ? "linear-gradient(90deg,rgba(66,165,245,0.25),rgba(66,165,245,0.08))"
                          : "transparent",
                        borderLeft: active
                          ? "3px solid #42a5f5"
                          : "3px solid transparent",
                        "&:hover": {
                          background:
                            "linear-gradient(90deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: active ? "#90caf9" : "rgba(255,255,255,0.65)",
                          minWidth: open ? 40 : "auto",
                        }}
                      >
                        <PeopleIcon />
                      </ListItemIcon>
                      {open && (
                        <ListItemText
                          primary="User Management"
                          primaryTypographyProps={{
                            fontSize: 14,
                            fontWeight: active ? 700 : 400,
                            color: active ? "#e3f2fd" : "rgba(255,255,255,0.8)",
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                </Tooltip>

                {/* Admin-only: Projects */}
                {(() => {
                  const projPath = "/projects";
                  const projActive = location.pathname === projPath;
                  return (
                    <Tooltip
                      title={!open ? "Projects" : ""}
                      placement="right"
                      arrow
                    >
                      <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          onClick={() => {
                            navigate(projPath);
                            if (isMobile) onClose();
                          }}
                          sx={{
                            borderRadius: 2,
                            py: 1.2,
                            px: open ? 2 : 1.5,
                            justifyContent: open ? "flex-start" : "center",
                            background: projActive
                              ? "linear-gradient(90deg,rgba(66,165,245,0.25),rgba(66,165,245,0.08))"
                              : "transparent",
                            borderLeft: projActive
                              ? "3px solid #42a5f5"
                              : "3px solid transparent",
                            "&:hover": {
                              background:
                                "linear-gradient(90deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: projActive
                                ? "#90caf9"
                                : "rgba(255,255,255,0.65)",
                              minWidth: open ? 40 : "auto",
                            }}
                          >
                            <FolderIcon />
                          </ListItemIcon>
                          {open && (
                            <ListItemText
                              primary="Projects"
                              primaryTypographyProps={{
                                fontSize: 14,
                                fontWeight: projActive ? 700 : 400,
                                color: projActive
                                  ? "#e3f2fd"
                                  : "rgba(255,255,255,0.8)",
                              }}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    </Tooltip>
                  );
                })()}

                {/* Admin: Team Timesheets */}
                {(() => {
                  const mgrPath = "/manager/timesheets";
                  const mgrActive = location.pathname === mgrPath;
                  return (
                    <Tooltip
                      title={!open ? "Team Timesheets" : ""}
                      placement="right"
                      arrow
                    >
                      <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          onClick={() => {
                            navigate(mgrPath);
                            if (isMobile) onClose();
                          }}
                          sx={{
                            borderRadius: 2,
                            py: 1.2,
                            px: open ? 2 : 1.5,
                            justifyContent: open ? "flex-start" : "center",
                            background: mgrActive
                              ? "linear-gradient(90deg,rgba(66,165,245,0.25),rgba(66,165,245,0.08))"
                              : "transparent",
                            borderLeft: mgrActive
                              ? "3px solid #42a5f5"
                              : "3px solid transparent",
                            "&:hover": {
                              background:
                                "linear-gradient(90deg,rgba(255,255,255,0.1),rgba(255,255,255,0.04))",
                            },
                            transition: "all 0.2s ease",
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              color: mgrActive
                                ? "#90caf9"
                                : "rgba(255,255,255,0.65)",
                              minWidth: open ? 40 : "auto",
                            }}
                          >
                            <SupervisorAccountIcon />
                          </ListItemIcon>
                          {open && (
                            <ListItemText
                              primary="Team Timesheets"
                              primaryTypographyProps={{
                                fontSize: 14,
                                fontWeight: mgrActive ? 700 : 400,
                                color: mgrActive
                                  ? "#e3f2fd"
                                  : "rgba(255,255,255,0.8)",
                              }}
                            />
                          )}
                        </ListItemButton>
                      </ListItem>
                    </Tooltip>
                  );
                })()}
              </>
            );
          })()}
      </List>

      {/* Footer version tag */}
      {open && (
        <Box sx={{ p: 2 }}>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.35)" }}
          >
            v1.0.0 • TimeSheet Pro
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED,
        flexShrink: 0,
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        "& .MuiDrawer-paper": {
          width: open ? DRAWER_WIDTH : DRAWER_COLLAPSED,
          overflowX: "hidden",
          transition: "width 0.25s ease",
          boxSizing: "border-box",
        },
        transition: "width 0.25s ease",
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
