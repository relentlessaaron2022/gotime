# Hand-off: Bamboo Solid 2000 Series landing page

**For:** whoever builds the landing page (you, ChatGPT, or a developer)
**Goal:** a product landing page where shoppers pick a sheet color and size and see that exact color on the bed in our animated "bag to bed" film.

Everything here is finished and tested. The only remaining job is the page around it.

---

## 1. What's in the folder

| File | What it is | Use it for |
|---|---|---|
| `bag-to-bed.html` | The interactive 30-second film. One self-contained file, about 400 KB, with fonts and the product photo built in. | The live color picker on the landing page |
| `landing-embed-example.html` | A working product section: the film on the left, size and color buttons on the right. | Copy the section into the landing page |
| `bamboo-queen-teal.mp4` | 30s video, 1920×1080, Queen, Teal | Hero video, social, ads |
| `bamboo-king-black.mp4` | 30s video, 1920×1080, King, Black | Hero video, social, ads |
| `stills/queen-*.jpg`, `stills/king-*.jpg` | 24 images of the finished bed: 12 colors × 2 sizes, 1920×1080 | Backup if the builder can't run code, plus product thumbnails |
| `render-video.js` | Renders the film to MP4 in any color and size | Making more videos |

---

## 2. Product facts (use these exactly)

- **Product:** Bamboo Solid 2000 Series Sheet Set
- **Pieces:** 6 (1 fitted sheet, 1 flat sheet, 4 pillowcases)
- **Sizes:** Queen (60" × 80") and King (76" × 80")
- **Colors (12):** Gold, Teal, Chocolate, White, Burgundy, Charcoal, Navy, Taupe, Sage, Burnt Orange, Blush, Black
- **Companion product:** Cool Comfort Bamboo Pillows, Queen and King
- **Wording note:** the packaging says **"2000 Series."** Don't write "2000 thread count" unless the owner confirms that claim in writing.

### Color swatch values (match the film)

| Color | Hex | Color | Hex |
|---|---|---|---|
| Gold | `#C48A2C` | Charcoal | `#4B4C51` |
| Teal | `#1C8486` | Navy | `#1F2D57` |
| Chocolate | `#5B3726` | Taupe | `#A39275` |
| White | `#F1EEE8` | Sage | `#8A9C84` |
| Burgundy | `#8C1C2D` | Burnt Orange | `#CF6128` |
| Blush | `#E9CCC7` | Black | `#1C1C1E` |

### Brand look

- Cream background `#FBF6EC`, deep green text `#26332A`, gold accent `#A97C25`
- Headlines: **Playfair Display**, bold, with the key words in gold italic
- Labels and buttons: **Montserrat**, uppercase labels with wide letter spacing
- Feel: calm, warm bedroom light, high-end without being stiff

---

## 3. How the color picker works

The film runs inside an `<iframe>`. The page talks to it with one line of JavaScript.

**Load it with a starting color and size (URL settings):**

```
bag-to-bed.html?embed&color=Teal&size=Queen
```

| Setting | Values | Default |
|---|---|---|
| `embed` | (no value) | Hides the film's own buttons so only the scene shows |
| `color` | Any color name above. Use `-` or `%20` for spaces, e.g. `Burnt-Orange` | Teal |
| `size` | `Queen` or `King` | Queen |
| `loop` | `1` to play on repeat | Plays once, then holds on the made bed |
| `cycle` | `1` to flash through several colors at the end | Off in embed mode, so the shopper's pick stays on the bed |

**Change the color, size or playback when a shopper clicks something:**

```js
const film = document.getElementById('bbFilm');           // the iframe
film.contentWindow.postMessage({ type: 'bamboo', color: 'Navy' }, '*');
film.contentWindow.postMessage({ type: 'bamboo', size: 'King' }, '*');
film.contentWindow.postMessage({ type: 'bamboo', action: 'replay' }, '*');   // also: 'play', 'pause', 'finish'
```

The color changes instantly at any point, even after the film has finished. A shopper can watch once, then click swatches and see each color on the made bed.

**The film also reports back** (optional, useful for analytics):

```js
window.addEventListener('message', e => {
  if (e.data && e.data.type === 'bamboo') console.log(e.data.event, e.data.color, e.data.size);
  // events: 'ready' when loaded, 'ended' when the 30s finishes
});
```

---

## 4. Hosting the film

`bag-to-bed.html` has to live at a public web address so the iframe can load it. Any one of these works:

1. **Same site as the landing page.** If the builder lets you upload files or add a custom page, upload `bag-to-bed.html` and point the iframe at it.
2. **Netlify Drop** (free, about 2 minutes). Go to app.netlify.com/drop, drag the `bamboo-bedding` folder in, and copy the URL it gives you.
3. **GitHub Pages** from the `gotime` repo. Turn on Pages in the repo settings, and the file will be at `https://<user>.github.io/gotime/bamboo-bedding/bag-to-bed.html`.

Then set the iframe `src` to that URL plus `?embed&color=Teal&size=Queen`.

### If the site builder won't accept custom code

Use the stills instead. Each swatch swaps the product image to `stills/<size>-<color>.jpg`, e.g. `stills/king-navy.jpg`. Use the MP4 as the hero video above it. The shopper still sees their color on the bed. The image just doesn't animate.

---

## 5. Suggested page layout

1. **Hero:** `bamboo-queen-teal.mp4` autoplaying muted on loop, headline *"The softest sheets on Earth."*, a "Shop the colors" button that scrolls down to section 2.
2. **Pick your set:** the section from `landing-embed-example.html`, with the film on the left and size, color, price and Add to Cart on the right.
3. **What's in the bag:** six pieces shown as a simple row: fitted sheet, flat sheet, 4 pillowcases.
4. **Why bamboo:** three short points. *Cool to the touch. Breathes all night. Gets softer every wash.* (Confirm the last one with the owner.)
5. **Complete the bed:** Cool Comfort Bamboo Pillows, Queen and King.
6. **The full lineup:** the 12-color product stack photo.
7. **FAQ:** fit, care, sizes, shipping, returns. Get the answers from the owner and don't invent any.
8. **Final call to action:** repeat the size and color picker, or link back to section 2.

### Copy already in the film (reuse for consistency)

- From the bag to the bed.
- The softest sheets on Earth.
- Deep pockets hug every corner.
- Cool to the touch. Breathes all night.
- Crisp like a five-star turndown.
- Silky cases slide right on.
- Slip in. Stay in.

---

## 6. Prompt to paste into ChatGPT

> I'm building a one-page landing page for my product, the **Bamboo Solid 2000 Series Sheet Set** (6 pieces: fitted sheet, flat sheet, 4 pillowcases; Queen 60"×80" and King 76"×80"; 12 colors: Gold, Teal, Chocolate, White, Burgundy, Charcoal, Navy, Taupe, Sage, Burnt Orange, Blush, Black).
>
> I already have an interactive animation file, `bag-to-bed.html`, hosted at **[PASTE URL]**. It goes in an iframe, and the page changes the sheet color and size inside it with `postMessage({ type: 'bamboo', color: 'Navy' }, '*')` and `postMessage({ type: 'bamboo', size: 'King' }, '*')`. The iframe URL is `[PASTE URL]?embed&color=Teal&size=Queen`. I'm attaching `landing-embed-example.html`, a working version of that section. Keep its script logic exactly as it is.
>
> Build the full page with these sections: hero video, the color and size picker section (from the example file, with a price and an Add to Cart button), what's in the bag, why bamboo, Cool Comfort Bamboo Pillows cross-sell, full lineup photo, FAQ placeholders, and a final call to action.
>
> Design: cream background #FBF6EC, deep green text #26332A, gold accent #A97C25. Playfair Display for headlines with key words in gold italic, and Montserrat for everything else. It has to work well on phones.
>
> Rules: call it "2000 Series", never "2000 thread count". Don't invent reviews, ratings, certifications or shipping promises; leave clearly marked placeholders for those. Write plainly and warmly, in short sentences.

Attach `landing-embed-example.html`, both MP4s, and a few stills when you send that prompt.

---

## 7. Before launch

- [ ] Film URL loads on its own in a browser
- [ ] Each of the 12 swatches changes the bed color
- [ ] Queen/King switch changes the bed width and the 60"/76" label
- [ ] Works on a phone, with the film full-width above the buttons
- [ ] Price, Add to Cart and FAQ answers filled in by the owner
- [ ] No "thread count" claim unless confirmed
