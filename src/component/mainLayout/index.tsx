"use client";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import CssBaseline from "@mui/material/CssBaseline";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LockResetIcon from "@mui/icons-material/LockReset";
import {
  Avatar,
  Button,
  ListSubheader,
  Menu,
  MenuItem,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { ReactNode, useState } from "react";
import { getMenuItems } from "@/utils/menu";
import { useSelector, useDispatch } from "react-redux";
// import { toggleMode } from "@/features/theme/themeSlice";
// import { AppDispatch, RootState } from "@/store";
// import { useTranslation } from "next-i18next";
import { Logout } from "@mui/icons-material";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { AppDispatch, RootState } from "@/store";
import Image from "next/image";
import { toggleMode } from "@/store/slices/themeSlice";
// import { logout } from "@/features/auth/authSlice";
import MenuIconHamburger from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useTranslations } from "next-intl";
const drawerWidth = 260;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(7)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        ...openedMixin(theme),
        "& .MuiDrawer-paper": openedMixin(theme),
      },
    },
    {
      props: ({ open }) => !open,
      style: {
        ...closedMixin(theme),
        "& .MuiDrawer-paper": closedMixin(theme),
      },
    },
  ],
}));

export default function RootLayout({
  children,
  token,
  user,
  userRole,
}: {
  children: ReactNode;
  token?: string;
  userRole?: string;
  user?: any;
}) {
  const t = useTranslations("menu");
  const menuItems = getMenuItems(t, userRole);
  const theme = useTheme();
  const [open, setOpen] = useState<boolean>(true);

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobilNavOpen, setMobilNavOpen] = useState<boolean>(false);

  const router = useRouter();

  const pathname = usePathname();

  const currentLocale = pathname.split("/")[1];

  const [languageAnchor, setLanguageAnchor] = useState<null | HTMLElement>(
    null
  );

  const locales = ["tr", "en", "nl"];

  const openLanguageMenu = (e: React.MouseEvent<HTMLElement>) => {
    setLanguageAnchor(e.currentTarget);
  };

  const changeLanguage = (lng: string) => {
    const segments = pathname.split("/");
    segments[1] = lng;
    router.push(segments.join("/"));
    setLanguageAnchor(null);
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (res.ok) {
        window.location.href = "/login";
      } else {
        console.error("Çıkış başarısız");
      }
    } catch (error) {
      console.error("Logout hatası:", error);
    }
  };
  const DRAWER_W = 280;

  const variants: Variants = {
    open: {
      x: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 260, damping: 26 },
    },
    closed: {
      x: -DRAWER_W,
      opacity: 0.5,
      transition: { type: "spring", stiffness: 280, damping: 28 },
    },
  };
  if (
    pathname === "/tr/checkSignature" ||
    pathname === "/en/checkSignature" ||
    pathname === "/nl/checkSignature" ||
    pathname === "/en/confirmationOfDocument" ||
    pathname === "/tr/confirmationOfDocument" ||
    pathname === "/nl/confirmationOfDocument"
  ) {
    return <Box sx={{ display: "flex" }}>{children}</Box>;
  }

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        {token ? (
          <>
            <AnimatePresence>
              {mobilNavOpen && (
                <motion.div
                  key="mobile-drawer"
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={variants}
                  style={{
                    position: "fixed",
                    top: 64,
                    left: 0,
                    height: "calc(100vh - 64px)",
                    width: DRAWER_W,
                    zIndex: 100,
                    willChange: "transform",
                    transform: "translateZ(0)",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      bgcolor: "#F5F5F5",
                      display: { xs: "block", md: "none" },
                      overflowY: "auto",
                    }}
                  >
                    <List>
                      {menuItems.map((item, index) => {
                        const segments = pathname.split("/").filter(Boolean);
                        const cleanPath =
                          "/" + (segments.slice(1).join("/") ?? "");
                        const isActive = cleanPath === item.url;
                        if (item.type === "subheader") {
                          return (
                            <ListSubheader
                              key={`subheader-${index}`}
                              component="div"
                              disableSticky
                              sx={{
                                fontSize: 14,
                                fontWeight: "bold",
                              }}
                            >
                              {item.text}
                            </ListSubheader>
                          );
                        }
                        return (
                          <Tooltip
                            key={index}
                            title={open ? "" : item.text}
                            disableHoverListener={open}
                            placement="right"
                            sx={{
                              "&:hover": {
                                bgcolor: "#e6f4ff",
                                color: "#1677ff",
                                ".listItemIcon": { color: "#1677ff" },
                              },
                              "&:hover > div > div": {
                                color: "#1677ff",
                              },
                              ...(isActive && {
                                bgcolor: "#e6f4ff",
                                color: "#1677ff",
                                ".listItemIcon": { color: "#1677ff" },
                                "& > div > div": { color: "#1677ff" },
                              }),
                              mb: 1,
                            }}
                          >
                            <ListItem
                              disablePadding
                              onClick={() => item.url && router.push(item.url)}
                            >
                              <ListItemButton>
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                              </ListItemButton>
                            </ListItem>
                          </Tooltip>
                        );
                      })}
                    </List>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            <Box
              position="fixed"
              display={{ xs: "flex", md: "none" }}
              width={"100%"}
              height={"64px"}
              bgcolor={"#F5F5F5"}
              alignItems={"center"}
              justifyContent={"space-between"}
              zIndex={100}
              px="24px"
            >
              <Box>
                {mobilNavOpen ? (
                  <MenuOpenIcon
                    fontSize="large"
                    onClick={() => setMobilNavOpen(!mobilNavOpen)}
                    sx={{ cursor: "pointer" }}
                  />
                ) : (
                  <MenuIconHamburger
                    fontSize="large"
                    onClick={() => setMobilNavOpen(!mobilNavOpen)}
                    sx={{ cursor: "pointer" }}
                  />
                )}
              </Box>
              {/* <Box
                sx={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <IconButton onClick={toggleLanguage}>
                  <Typography>
                    {currentLocale === "tr" ? "TR" : "EN"}
                  </Typography>
                </IconButton>
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{
                    p: 0,
                    "&:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                  disableFocusRipple
                  disableRipple
                >
                  <Avatar alt="Remy Sharp" />
                  <Typography sx={{ ml: 1 }}>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                </IconButton>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <MenuItem onClick={handleLogout}>
                    <>
                      <Typography sx={{ textAlign: "center", mr: 2 }}>
                        Logout
                      </Typography>
                      <IconButton disableRipple>
                        <Logout />
                      </IconButton>
                    </>
                  </MenuItem>
                </Menu>
              </Box> */}
            </Box>
            <AppBar
              position="fixed"
              open={open}
              color="default"
              sx={{
                width: `calc(100% - ${open ? drawerWidth : 57}px)`,
                ml: `${drawerWidth}px`,
                display: {
                  xs: "none",
                  md: "flex",
                },
              }}
            >
              <Toolbar
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  sx={[
                    {
                      mr: 2,
                    },
                    open && { display: "none" },
                  ]}
                >
                  <MenuIcon />
                </IconButton>
                <Box
                  sx={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <IconButton onClick={openLanguageMenu}>
                    <Typography>{currentLocale.toUpperCase()}</Typography>
                  </IconButton>

                  <Menu
                    anchorEl={languageAnchor}
                    open={Boolean(languageAnchor)}
                    onClose={() => setLanguageAnchor(null)}
                  >
                    {locales.map((lng) => (
                      <MenuItem key={lng} onClick={() => changeLanguage(lng)}>
                        {lng.toUpperCase()}
                      </MenuItem>
                    ))}
                  </Menu>
                  <IconButton
                    onClick={handleOpenUserMenu}
                    sx={{
                      p: 0,
                      "&:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                    disableFocusRipple
                    disableRipple
                  >
                    <Avatar alt="Remy Sharp" />
                    <Typography sx={{ ml: 1 }}>
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </IconButton>
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem
                      sx={{
                        ":hover": {
                          bgcolor: "white",
                        },
                      }}
                    >
                      <Box display={"flex"} flexDirection={"column"}>
                        <Box
                          display={"flex"}
                          alignItems={"center"}
                          onClick={handleLogout}
                        >
                          <Typography sx={{ textAlign: "center", mr: 2 }}>
                            Logout
                          </Typography>
                          <IconButton disableRipple>
                            <Logout />
                          </IconButton>
                        </Box>
                      </Box>
                    </MenuItem>
                  </Menu>
                </Box>
              </Toolbar>
            </AppBar>
            <Drawer
              variant="permanent"
              open={open}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              <DrawerHeader
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  sx={{ flex: 1 }}
                  disableRipple
                  disableFocusRipple
                  variant="text"
                  href="/dashboard"
                >
                  <img
                    src="/Dikont-Logo.svg"
                    alt=""
                    style={{
                      width: open ? "127px" : "50px",
                      height: open ? "100%" : "auto",
                      transition: "all 0.3s",
                    }}
                  />
                </Button>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === "ltr" ? (
                    <ChevronLeftIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </IconButton>
              </DrawerHeader>
              <Divider />
              <List>
                {menuItems.map((item, index) => {
                  const segments = pathname.split("/").filter(Boolean);
                  const cleanPath = "/" + (segments.slice(1).join("/") ?? "");
                  const isActive = cleanPath === item.url;
                  if (item.type === "subheader") {
                    return open ? (
                      <ListSubheader
                        key={`subheader-${index}`}
                        component="div"
                        disableSticky
                        sx={{
                          fontSize: 14,
                          fontWeight: "bold",
                        }}
                      >
                        {item.text}
                      </ListSubheader>
                    ) : (
                      <Divider key={`divider-${index}`} />
                    );
                  }

                  return (
                    <Tooltip
                      key={index}
                      title={open ? "" : item.text}
                      disableHoverListener={open}
                      placement="right"
                      sx={{
                        "&:hover": {
                          bgcolor: "#e6f4ff",
                          color: "#1677ff",
                          ".listItemIcon": { color: "#1677ff" },
                        },
                        "&:hover > div > div": {
                          color: "#1677ff",
                        },
                        ...(isActive && {
                          bgcolor: "#e6f4ff",
                          color: "#1677ff",
                          ".listItemIcon": { color: "#1677ff" },
                          "& > div > div": { color: "#1677ff" },
                        }),
                        mb: 1,
                      }}
                    >
                      <ListItem
                        disablePadding
                        onClick={() => {
                          if (item.url) router.push(item.url);
                        }}
                      >
                        <ListItemButton>
                          <ListItemIcon>{item.icon}</ListItemIcon>
                          <ListItemText primary={item.text} />
                        </ListItemButton>
                      </ListItem>
                    </Tooltip>
                  );
                })}
              </List>
              <List sx={{ mt: "auto" }}>
                <Divider />
                {/* <ListItem disablePadding>
                  {open ? (
                    <ListItemButton
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
                      <p>{darkMode ? "Dark" : "Light"} Mode</p>
                      <Switch
                        checked={darkMode === "dark"}
                        onClick={() => dispatch(toggleMode())}
                      />
                    </ListItemButton>
                  ) : (
                    <ListItemButton onClick={() => dispatch(toggleMode())}>
                      {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
                    </ListItemButton>
                  )}
                </ListItem> */}
              </List>
            </Drawer>
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                // width: `calc(100% - ${open ? drawerWidth : 57}px)`,
                backgroundColor:
                  theme.palette.mode === "dark"
                    ? theme.palette.background.default
                    : "#fafafb",
                minHeight: "100vh",
                height: "100%",
                pt: "100px",
              }}
            >
              {children}
            </Box>
          </>
        ) : (
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              // width: `calc(100% - ${open ? drawerWidth : 57}px)`,
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.background.default
                  : "#fafafb",
              minHeight: "100vh",
              height: "100%",
            }}
          >
            <Box
              m={"-24px"}
              px={"32px"}
              height={"64px"}
              bgcolor={"#fff"}
              position={"relative"}
              display={"flex"}
              alignItems={"center"}
              // zIndex={99}
              justifyContent={"space-between"}
            >
              <Image
                src="/Dikont-Logo.svg"
                alt="Login Image"
                width={72}
                height={28}
                style={{ objectFit: "cover" }}
              />
              <Box>
                <IconButton onClick={openLanguageMenu}>
                  <Typography>{currentLocale.toUpperCase()}</Typography>
                </IconButton>

                <Menu
                  anchorEl={languageAnchor}
                  open={Boolean(languageAnchor)}
                  onClose={() => setLanguageAnchor(null)}
                >
                  {locales.map((lng) => (
                    <MenuItem key={lng} onClick={() => changeLanguage(lng)}>
                      {lng.toUpperCase()}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Box>
            {children}
          </Box>
        )}
      </Box>
    </>
  );
}
