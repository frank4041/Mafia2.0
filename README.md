# 🇳🇬 Police & Thief

A 3D social deduction game inspired by **Among Us** and **Mafia**, set in a Nigerian residential compound.

![Game Preview](https://img.shields.io/badge/3D-React_Three_Fiber-blue) ![Status](https://img.shields.io/badge/Status-Demo-green) ![Players](https://img.shields.io/badge/Players-7-yellow)

## 🎮 About

Players are secretly divided into two teams:
- **Civilians** (majority) — Complete tasks and find the thieves
- **Thieves** (minority) — Eliminate civilians without getting caught

## 🏠 Demo Map

A Nigerian residential compound with:
- 🌳 Yard
- 🛋️ Living Room
- 🛏️ Bedroom
- 🍳 Kitchen
- 🚿 Bathroom
- ⚡ Generator Area
- 🚪 Gate

## 🎯 Gameplay Loop

```
Move → Complete Tasks → Thief Kills → Body Discovered → 
Emergency Meeting → Discuss → Vote → Eliminate → Repeat → Win!
```

## 🕹️ Controls

| Key | Action |
|-----|--------|
| W / ↑ | Move Forward |
| S / ↓ | Move Backward |
| A / ← | Move Left |
| D / → | Move Right |
| Click | Interact / Report / Kill |

## 🏆 Win Conditions

- **Civilians Win** — All thieves have been voted out
- **Thieves Win** — Number of thieves equals or exceeds civilians

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/police-and-thief.git
cd police-and-thief

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Tech Stack

- **React 18** — UI framework
- **React Three Fiber** — 3D rendering
- **Three.js** — 3D engine
- **Tailwind CSS** — Styling
- **TypeScript** — Type safety
- **Vite** — Build tool

## 📁 Project Structure

```
src/
├── App.tsx                  # Main game orchestrator
├── types/
│   └── game.ts             # TypeScript type definitions
├── game/
│   └── gameLogic.ts        # Core logic, AI, state management
├── components/
│   ├── GameScene.tsx        # 3D scene with camera & controls
│   ├── Map.tsx              # Nigerian compound 3D environment
│   ├── Player.tsx           # 3D player character models
│   ├── GameHUD.tsx          # In-game HUD overlay
│   ├── MeetingUI.tsx        # Meeting/chatroom interface
│   └── Screens.tsx          # Lobby & game over screens
└── index.css               # Global styles
```

## 🗺️ Roadmap

- [ ] Online multiplayer
- [ ] Additional maps (Lagos Market, Abuja Villa, etc.)
- [ ] More roles (Police Chief, Informant)
- [ ] Advanced bot AI
- [ ] Voice chat during meetings
- [ ] Custom lobbies
- [ ] Ranking system
- [ ] More outfits & cosmetics

## 📝 Demo Scope

This is a **small demo** to prove the core gameplay works. It does NOT include:
- ❌ Online multiplayer
- ❌ User accounts
- ❌ Backend server
- ❌ Multiple maps
- ❌ Complex matchmaking
- ❌ Advanced AI
- ❌ Inventory systems
- ❌ Progression systems
- ❌ Monetization

The code is **modular** and designed for future expansion.

## 🇳🇬 Nigerian Identity

The game embraces Nigerian culture through:
- Nigerian names for all characters
- Residential compound setting
- Generator area (very Nigerian!)
- Water tank details
- Compound walls and gate
- Nigerian Pidgin dialogue from bots
- Everyday clothing (not uniforms)

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! This is a demo project designed to be extended.

---

Made with ❤️ for the Nigerian gaming community
