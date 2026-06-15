export type AppView =
  | "home"
  | "adventure"
  | "sect"
  | "market"
  | "secretRealm"
  | "inventory"
  | "log";

interface BottomNavItem {
  key: AppView;
  icon: string;
  label: string;
}

interface Props {
  currentView: AppView;
  onChange: (view: AppView) => void;
}

const items: BottomNavItem[] = [
  { key: "home", icon: "🏠", label: "首页" },
  { key: "adventure", icon: "⚔️", label: "历练" },
  { key: "sect", icon: "⛩️", label: "宗门" },
  { key: "market", icon: "🏮", label: "坊市" },
  { key: "inventory", icon: "🎒", label: "背包" },
];

const BottomNav = ({ currentView, onChange }: Props) => {
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const isActive = currentView === item.key;
        return (
          <button
            key={item.key}
            type="button"
            className={isActive ? "nav-item active" : "nav-item"}
            onClick={() => onChange(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
