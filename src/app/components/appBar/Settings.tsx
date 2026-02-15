import {
    DropdownItem,
    DropdownMenu,
    Switch,
} from "@heroui/react";
import { useTheme } from "next-themes";
import { Moon, Languages, Music } from "lucide-react";
import { useState } from "react";

export default function Menu() {
    const { resolvedTheme, setTheme } = useTheme();
    const SETTINGS_LABEL = "Settings";

    const DARK_MODE_LABEL = "Dark mode";
    const isDark = resolvedTheme === "dark";

    const [isBigFont, setIsBigFont] = useState(false)
    const BIG_FONT_LABEL = "Big font"

    const [hasSound, setHasSound] = useState(true)
    const HAS_SOUND_LABEL = "Sound"

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
                        isSelected={hasSound}
                        onValueChange={(nextValue) => setHasSound(nextValue)}
                        size="sm"
                    />
                </div>
            </DropdownItem>

            <DropdownItem
                key={BIG_FONT_LABEL}
                textValue={BIG_FONT_LABEL}
                startContent={<Languages aria-hidden="true" size={16} />}
            >
                <div className="flex w-full items-center justify-between gap-3">
                    <span>{BIG_FONT_LABEL}</span>
                    <Switch
                        aria-label={BIG_FONT_LABEL}
                        isSelected={isBigFont}
                        onValueChange={(nextValue) => setIsBigFont(nextValue)}
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
                        onValueChange={(nextIsDark) => setTheme(nextIsDark ? "dark" : "light")}
                        size="sm"
                    />
                </div>
            </DropdownItem>
        </DropdownMenu>
    )
}