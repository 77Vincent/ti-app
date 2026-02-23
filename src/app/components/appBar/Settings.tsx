import {
  DropdownItem,
  DropdownMenu,
  Switch,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { Moon, Music } from "lucide-react";
import { useSettingsStore } from "@/lib/settings/store";

export default function Menu() {
  const { resolvedTheme, setTheme } = useTheme();
  const isSoundEnabled = useSettingsStore((state) => state.isSoundEnabled);
  const setIsSoundEnabled = useSettingsStore(
    (state) => state.setIsSoundEnabled,
  );
  const SETTINGS_LABEL = "Settings";

  const DARK_MODE_LABEL = "Dark mode";
  const isDark = resolvedTheme === "dark";

  const HAS_SOUND_LABEL = "Sound";

  return (
    <DropdownMenu aria-label={SETTINGS_LABEL} closeOnSelect={false}>
      <DropdownItem
        key={HAS_SOUND_LABEL}
        textValue={HAS_SOUND_LABEL}
        startContent={<Music aria-hidden="true" size={16} />}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <span>{HAS_SOUND_LABEL}</span>
          <Switch
            aria-label={HAS_SOUND_LABEL}
            isSelected={isSoundEnabled}
            onValueChange={setIsSoundEnabled}
            size="sm"
          />
        </div>
      </DropdownItem>

      <DropdownItem
        key={DARK_MODE_LABEL}
        textValue={DARK_MODE_LABEL}
        startContent={<Moon aria-hidden="true" size={16} />}
      >
        <div className="flex w-full items-center justify-between gap-3">
          <span>{DARK_MODE_LABEL}</span>
          <Switch
            aria-label={DARK_MODE_LABEL}
            isSelected={isDark}
            onValueChange={(nextIsDark) =>
              setTheme(nextIsDark ? "dark" : "light")
            }
            size="sm"
          />
        </div>
      </DropdownItem>
    </DropdownMenu>
  );
}
