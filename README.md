# Taodock for Make.com

Custom [Make](https://www.make.com) app (IML definitions) for generating images and videos with [Taodock](https://taodock.com) AI models.

## Modules

| Module | Type | What it does |
|---|---|---|
| **List Models** | search | Iterate the model IDs available to the connected API key. |
| **Generate Image** | action | Generate 1–4 images from a prompt; outputs base64 image data. |
| **Create Video** | action | Start an async video task; outputs `task_id` + `status`. |
| **Get Video Status** | action | Poll a task's status/progress. |
| **Download Video** | action | Download a completed video as a binary file (MP4). |

Video flow: **Create Video** → poll **Get Video Status** until `completed` (use a Sleep module between polls) → **Download Video**.

## Install as a private custom app

Make custom apps are defined in the Make UI by pasting these JSON files — no hosting required.

1. In Make, open **More → Custom apps** (requires a paid plan or the free trial) → **Create a new app**. Name it `Taodock`, label `Taodock`, description `Generate images and videos with Taodock AI models`.
2. **Base** tab: paste `base.json`.
3. **Connections → Create a new connection** (type: API Key): paste the `parameters` array from `connection.json` into *Parameters* and the `communication` object into *Communication*. Name the connection `apiKey` (module files reference `{{connection.apiKey}}` and `"connection": "apiKey"`).
4. **Modules → Create a new module** for each file in `modules/`: set *Type*, paste *Communication*, *Parameters* (`parameters`), *Interface* (`interface`), and *Samples* (`samples`) into the corresponding tabs.
5. In a scenario, add a Taodock module and create a connection with your Taodock API key (`sk-...` from <https://taodock.com>). The key is sent only to `https://taodock.com/v1` and is sanitized from execution logs.

> The app is private by default. Public submission to the Make marketplace is a separate, irreversible step handled only after explicit confirmation.

## Repo layout

```
base.json                 App base (baseUrl, auth header, log sanitize)
connection.json           API key connection (parameters + test request)
modules/*.json            One module per file (communication/parameters/interface/samples)
tests/validate.test.mjs   Structural checks: `npm test`
```

## Security

- No secrets in this repo; the API key is user-supplied per connection and masked in logs (`log.sanitize`).
- License: MIT. Source: <https://github.com/taodock-api/taodock-make>
