# Spot the Difference Game

A configurable "Spot the Difference" game built with HTML, CSS, and JavaScript.

## How to Run

1. Place your images (e.g., `image1.jpg`, `image2.jpg`) in the project directory.
2. Edit `game-config.json` to set your image paths and difference coordinates.
3. Open `index.html` in your browser.

## How It Works

- The game loads configuration from `game-config.json`.
- The JSON file specifies:
  - The game title
  - Paths to the two images
  - The coordinates and sizes of each difference (bounding boxes)
- When the player clicks on a difference, it is highlighted and the score increases.
- When all differences are found, a success message and sound are played.
- The game is responsive and includes a timer.

## JSON Config Example

```
{
  "gameTitle": "Spot the Difference - Animals",
  "images": {
    "image1": "image1.jpg",
    "image2": "image2.jpg"
  },
  "differences": [
    { "x": 100, "y": 200, "width": 50, "height": 50 },
    { "x": 300, "y": 150, "width": 40, "height": 40 },
    { "x": 500, "y": 300, "width": 30, "height": 30 }
  ]
}
```

## Customization

- To change the images or the locations of the differences, simply update `game-config.json`.
- You can add or remove differences by editing the `differences` array.

## Features

- Highlights found differences
- Score and timer
- Success message and sound
- Responsive design for mobile

---

**To deploy:**
- Upload the project to Vercel, GitHub Pages, or any static hosting provider. 