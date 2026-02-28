import { ReactNode } from 'react';
import { FaPlaystation, FaXbox, FaWindows, FaApple, FaAndroid, FaSteam, FaGamepad } from 'react-icons/fa';
import { SiNintendo } from 'react-icons/si';

export interface PlatformGroup {
    id: string;
    name: string;
    icon: ReactNode;
    platforms: string[];
}

export const getUniquePlatformGroups = (platformStrings: string[]): PlatformGroup[] => {
    const groups = new Map<string, PlatformGroup>();

    platformStrings.forEach(platformStr => {
        const p = platformStr.toLowerCase();
        let id = 'gamepad';
        let name = 'Other';
        let icon = <FaGamepad className="w-3.5 h-3.5" />;

        if (p.includes('ps') || p.includes('playstation')) {
            id = 'playstation';
            name = 'PlayStation';
            icon = <FaPlaystation className="w-4 h-4" />;
        } else if (p.includes('xbox')) {
            id = 'xbox';
            name = 'Xbox';
            icon = <FaXbox className="w-4 h-4" />;
        } else if (p.includes('nintendo') || p.includes('switch') || p.includes('wii') || p.includes('nds') || p.includes('3ds')) {
            id = 'nintendo';
            name = 'Nintendo';
            icon = <SiNintendo className="w-4 h-4" />;
        } else if (p.includes('mac') || p.includes('ios') || p.includes('apple')) {
            id = 'apple';
            name = 'Apple';
            icon = <FaApple className="w-4 h-4" />;
        } else if (p.includes('android')) {
            id = 'android';
            name = 'Android';
            icon = <FaAndroid className="w-4 h-4" />;
        } else if (p.includes('steam')) {
            id = 'steam';
            name = 'Steam';
            icon = <FaSteam className="w-4 h-4" />;
        } else if (p.includes('pc') || p.includes('win') || p.includes('linux')) {
            id = 'windows';
            name = 'PC / Windows';
            icon = <FaWindows className="w-4 h-4" />;
        }

        if (groups.has(id)) {
            groups.get(id)!.platforms.push(platformStr);
        } else {
            groups.set(id, { id, name, icon, platforms: [platformStr] });
        }
    });

    return Array.from(groups.values());
};
