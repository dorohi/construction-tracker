import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import {
  Divider,
  Drawer,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useStore } from "../../stores/RootStore";
import ThemeToggle from '@/components/sidebar/ThemeToggle';
import UserBlock from '@/components/sidebar/UserBlock';
import LogoutDialog from '@/components/sidebar/LogoutDialog';
import Settings from '@/components/sidebar/Settings';
import MenuItems from '@/components/sidebar/MenuItems';

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 65;

const Sidebar = observer(() => {
  const { uiStore, authStore, themeStore } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const open = uiStore.sidebarOpen;

  const drawerWidth = isMobile ? DRAWER_WIDTH : open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED;

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) uiStore.closeSidebar();
  };

  // On mobile always show text (drawer is full-width overlay)
  const showText = isMobile || open;

  const drawerContent = (
    <>
      <Toolbar />

      {/* Navigation */}
      <MenuItems showText={showText} handleNavigate={handleNavigate} />

      {/* Settings */}
      <Divider />
      <Settings showText={showText} handleNavigate={handleNavigate} />

      {/* Theme toggle */}
      <Divider />
      <ThemeToggle showText={showText} themeStore={themeStore} />

      {/* User block */}
      <Divider />
      <UserBlock showText={showText} authStore={authStore}/>
    </>
  );

  if (isMobile) {
    return (
      <>
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => uiStore.closeSidebar()}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <LogoutDialog authStore={authStore} />
      </>
    );
  }

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          whiteSpace: "nowrap",
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            transition: (t) =>
              t.transitions.create("width", {
                easing: t.transitions.easing.sharp,
                duration: open
                  ? t.transitions.duration.enteringScreen
                  : t.transitions.duration.leavingScreen,
              }),
            overflowX: "hidden",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <LogoutDialog authStore={authStore} />
    </>
  );
});

export default Sidebar;
