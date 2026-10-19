# Worship Pad & Click

Pad sound in all 12 keys and a click track for the Cedar Crossing worship band, with a shared song library and setlist.

- **Pad** goes to the house and the in-ears. **Click** goes to the in-ears only.
- Default routing: **left output = click, right output = pad**. Use a 3.5 mm TRS to dual ¼" cable into two X32 inputs. Turn the click channel's LR assign off and send it only to the in-ear bus.
- Anyone with the link can load songs and play. Adding, editing and changing the setlist need the band's editing PIN.
- After the first visit the app works offline, using the last synced library.

## Shortcuts

| Key | Action |
| --- | --- |
| Space | Start/stop pad + click |
| C | Start/stop click |
| P | Start/stop pad |
| T | Tap tempo |
| ↑ ↓ | Tempo ±1 |
| ← → | Previous / next song in the setlist |

## How it's built

- `index.html` – the whole app. Sounds are generated live in the browser (Web Audio); there are no audio files.
- `sw.js` – offline cache. **When you change `index.html`, change `padclick-v1` to `padclick-v2` (and so on) in `sw.js`** so every device picks up the new version. Devices get updates the second time they open the app.
- Song library: Supabase project `lamithxecgiblsgvoszy`, tables `songs` and `setlist_items`. Changes go through PIN-checked database functions.
- `.github/workflows/keep-awake.yml` – daily check-in so the free Supabase project doesn't pause.

## Change the editing PIN

In Supabase, open **SQL Editor**, run this with the new PIN, and tell the band:

```sql
update private.settings set pin_hash = extensions.crypt('NEW-PIN', extensions.gen_salt('bf')) where id = 1;
```

Everyone will be asked to unlock again the next time they make a change.
