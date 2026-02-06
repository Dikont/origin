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
import {
  Avatar,
  Button,
  ListSubheader,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { ReactNode, useState } from "react";
import { getMenuItems } from "@/utils/menu";
import { Logout } from "@mui/icons-material";
import { usePathname } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import MenuIconHamburger from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { GlobalStyles } from "@mui/material";

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
  userRoles,
}: {
  children: ReactNode;
  token?: string;
  userRoles?: string[];
  user?: any;
}) {
  const t = useTranslations("menu");
  const locale = useLocale();
  const menuItems = getMenuItems(t, userRoles, locale);
  const theme = useTheme();
  const [open, setOpen] = useState<boolean>(true);

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobilNavOpen, setMobilNavOpen] = useState<boolean>(false);

  const router = useRouter();

  const pathname = usePathname();
  // Aktif menü için yardımcılar
  const normalizePath = (p: string) => {
    const noQuery = p.split("?")[0].split("#")[0];
    return noQuery !== "/" ? noQuery.replace(/\/+$/, "") : "/";
  };

  const isActiveMenu = (current: string, target?: string) => {
    if (!target) return false;
    const cur = normalizePath(current);
    const t = normalizePath(target);
    if (cur === t) return true;
    return cur.startsWith(t + "/");
  };

  const currentLocale = pathname.split("/")[1];

  const languageOptions = [
    { code: "tr", label: "TR", flag: "/login/tr1.png" },
    { code: "en", label: "EN", flag: "/login/en2.png" },
    { code: "nl", label: "NL", flag: "/login/nl3.png" },
  ];

  const changeLanguage = (lng: string) => {
    // Dil değiştirmede parametreleri koruma
    const search = window.location.search;
    const segments = pathname.split("/");
    segments[1] = lng;

    router.push(segments.join("/") + search);
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
        <GlobalStyles
          styles={{
            "@keyframes headerGradient": {
              "0%": { backgroundPosition: "0% 50%" },
              "50%": { backgroundPosition: "100% 50%" },
              "100%": { backgroundPosition: "0% 50%" },
            },
          }}
        />
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
            </Box>
            {/* Header Alanı */}
            <AppBar
              position="fixed"
              open={open}
              sx={{
                // Desktop: drawer'a göre genişlik ayarla
                width: {
                  xs: "100%",
                  md: `calc(100% - ${open ? drawerWidth : 57}px)`,
                },
                // Desktop: drawer açıkken margin-left ver
                ml: {
                  xs: 0,
                  md: open ? `${drawerWidth}px` : "57px",
                },
                // background yerine backgroundImage kullan
                display: "flex",
                backgroundImage: `linear-gradient(
      90deg,
      #2C1737 0%,
      #5C2230 50%,
      #453562 100%
    )`,
                backgroundSize: "300% 300%",
                animation: "headerGradient 15s ease infinite",

                // bazen MUI default overlay / shadow karışır:
                boxShadow: "none",
                color: "#fff",
              }}
            >
              <Toolbar
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                  minHeight: 64,
                  px: { xs: 1.5, md: 2 },
                }}
              >
                {/* SOL TARAF: Mobil hamburger + Desktop drawer open */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* MOBİL HAMBURGER (xs - sm) */}
                  <Box
                    sx={{
                      display: { xs: "flex", md: "none" },
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      color="inherit"
                      onClick={() => setMobilNavOpen(!mobilNavOpen)}
                      sx={{ mr: 0.5 }}
                    >
                      {mobilNavOpen ? <MenuOpenIcon /> : <MenuIconHamburger />}
                    </IconButton>

                    {/*  LOGO (hamburger yanında) */}
                    <Box
                      component="img"
                      src="/Dikont-Logo-Beyaz.svg"
                      alt="Dikont"
                      onClick={() => router.push("/dashboard")}
                      sx={{
                        ml: 1,
                        width: 100,
                        height: 34,
                        objectFit: "contain",
                        cursor: "pointer",
                        // çok küçük ekranda taşmasın
                        flexShrink: 0,
                      }}
                    />
                  </Box>

                  {/* DESKTOP DRAWER OPEN BUTONU (md+) */}
                  <Box sx={{ display: { xs: "none", md: "flex" } }}>
                    <IconButton
                      color="inherit"
                      aria-label="open drawer"
                      onClick={handleDrawerOpen}
                      edge="start"
                      sx={[{ mr: 1 }, open && { display: "none" }]}
                    >
                      <MenuIcon />
                    </IconButton>
                  </Box>
                </Box>

                {/* SAĞ TARAF: Dil + User */}
                <Box
                  sx={{
                    marginLeft: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: { xs: 1, md: 2 },
                  }}
                >
                  {/* DİL SEÇİCİ */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {languageOptions.map((lang) => {
                      const isActive = lang.code === currentLocale;

                      return (
                        <Button
                          key={lang.code}
                          onClick={() => changeLanguage(lang.code)}
                          disableRipple
                          variant="text"
                          sx={{
                            minWidth: 0,
                            px: { xs: 1.2, md: 2.5 },
                            py: { xs: 0.8, md: 1.2 },
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            textTransform: "none",
                            color: "#fff",

                            opacity: isActive ? 1 : 0.65,
                            backgroundColor: isActive
                              ? "rgba(0,0,0,0.22)"
                              : "transparent",

                            "&:hover": {
                              backgroundColor: isActive
                                ? "rgba(0,0,0,0.28)"
                                : "rgba(255,255,255,0.12)",
                              opacity: 1,
                            },
                          }}
                        >
                          <Box
                            component="img"
                            src={lang.flag}
                            alt={lang.label}
                            sx={{
                              width: 22,
                              height: 16,
                              borderRadius: "2px",
                              objectFit: "cover",
                              boxShadow: isActive
                                ? "0 0 0 2px rgba(255,255,255,0.7)"
                                : "none",
                            }}
                          />

                          {/* ✅ Mobilde yazı gizli, sm+ görünür */}
                          <Typography
                            sx={{
                              display: { xs: "none", sm: "block" },
                              fontWeight: isActive ? 700 : 500,
                              fontSize: 13,
                              color: "#fff",
                            }}
                          >
                            {lang.label}
                          </Typography>
                        </Button>
                      );
                    })}
                  </Box>

                  {/* USER BUTONU */}
                  <IconButton
                    onClick={handleOpenUserMenu}
                    sx={{
                      p: 0,
                      "&:hover": { backgroundColor: "transparent" },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Avatar alt="User" />
                    {/* ✅ Mobilde isim gizli, md+ görünür */}
                    <Typography
                      sx={{
                        display: { xs: "none", md: "block" },
                        fontWeight: 500,
                        fontSize: 16,
                        color: "#fff",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user?.firstName} {user?.lastName}
                    </Typography>
                  </IconButton>

                  {/* USER MENÜ */}
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                    keepMounted
                    transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        minWidth: 160,
                        ":hover": { bgcolor: "white" },
                      }}
                    >
                      <Typography>Logout</Typography>
                      <Logout fontSize="small" />
                    </MenuItem>
                  </Menu>
                </Box>
              </Toolbar>
            </AppBar>
            {/* Header Alanı Bitiş */}

            {/* Menü Alanı */}
            <Drawer
              variant="permanent"
              open={open}
              sx={{
                display: { xs: "none", md: "block" },
              }}
            >
              <DrawerHeader
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Button
                  disableRipple
                  disableFocusRipple
                  variant="text"
                  href="/dashboard"
                  sx={{
                    minWidth: 0,
                    px: 3,

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={open ? "/Dikont-Logo.svg" : "/kucukDikont-Logo.png"}
                    alt="Dikont"
                    style={{
                      width: open ? 120 : 36,
                      height: open ? 32 : 36,
                      objectFit: "contain",
                      transition: "all 0.5s ease",
                      display: "block",
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
                  const active = isActiveMenu(pathname, item.url);
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
                        mb: 1,
                      }}
                    >
                      <ListItem
                        disablePadding
                        onClick={() => {
                          if (!item.url) return;

                          if (item.target === "_blank") {
                            window.open(
                              item.url,
                              "_blank",
                              "noopener,noreferrer",
                            );
                            return;
                          }

                          router.push(item.url);
                        }}
                      >
                        <ListItemButton
                          selected={active}
                          sx={{
                            /* ========== NORMAL ========== */
                            color: "#3c3c3c",

                            "& .MuiListItemIcon-root": {
                              color: "#3c3c3c",
                            },

                            /* ========== HOVER (seçili değilken) ========== */
                            "&:hover": {
                              bgcolor: "#646E9F",
                              color: "#ffffff",
                            },
                            "&:hover .MuiListItemIcon-root": {
                              color: "#ffffff",
                            },

                            /* ========== SELECTED (aktif sayfa) ========== */
                            "&.Mui-selected": {
                              bgcolor: "#453562", // seçiliyken bg
                              color: "#ffffff", // seçiliyken text
                            },
                            "&.Mui-selected .MuiListItemIcon-root": {
                              color: "#ffffff", // seçiliyken icon
                            },

                            /* ========== SELECTED + HOVER ========== */
                            "&.Mui-selected:hover": {
                              bgcolor: "#5a4375", // seçiliyken hover bg
                              color: "#ffffff",
                            },
                            "&.Mui-selected:hover .MuiListItemIcon-root": {
                              color: "#ffffff",
                            },
                          }}
                        >
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
              </List>
            </Drawer>
            {/* Menü Alanı Bitiş */}

            {/* Panel Ana Yapı Alanı */}
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
            {/* Panel Ana Yapı Alanı Bitiş */}
          </>
        ) : (
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              // DÜZELTME 1: Padding'i tamamen sıfırladık
              p: 0,

              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.background.default
                  : "#fafafb",
              minHeight: "100vh",
              height: "100%",

              // DÜZELTME 2: Flex Column ekledik ki Header ve Sayfa alt alta yapışsın
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* DÜZELTME 4: Children'ı bir Box içine alıp kalan alanı kaplamasını sağladık */}
            <Box sx={{ flex: 1, position: "relative" }}>{children}</Box>
          </Box>
        )}
      </Box>
    </>
  );
}
