# Comfort Cloud System

Hackathon frontend project built with a modern React stack.

## Tech Stack
- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

## Setup

```sh
npm install
npm run dev


## make changes 
Root : vite.config.ts,tailwind.config.ts,package.json,index.html

src/index.css




MOST IMPORTANT (keep & focus on these)

pages/

This is your main app screens

Dashboard, Alerts, SOS, Shelters, etc.

👉 Core logic + routing lives here

components/dashboard/

Reusable parts used in Dashboard

AlertsFeed, ShelterMap, StatusCard

👉 Important for UI structure

components/layout/

Layout.tsx, Sidebar.tsx

Controls overall app layout

👉 Very important

App.tsx

Root component

Routes + layout connection

👉 Mandatory

main.tsx

App entry point

React mounts here

👉 Mandatory (don’t touch much)

index.css

Tailwind + global styles

👉 Required for styling

lib/utils.ts

Helper functions

👉 Important if used (check imports)

IMPORTANT BUT SECONDARY

components/NavLink.tsx

Sidebar navigation links

👉 Needed if sidebar uses it

hooks/

Custom hooks

👉 Keep only if you are using them

CAN BE IGNORED FOR NOW (not core logic)

components/ui/

UI primitives (buttons, cards, etc.)

👉 Can ignore now, useful later

App.css

Often unused when Tailwind is used

👉 Can delete if empty / unused