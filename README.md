# Monogram Env Sync

Monogram Env Sync (`mes`) is a tool to sync up a project's .env file.

## Install

To install run the following command:

```sh
npm i -g @monogram/mes-cli
```

## How to use

### Configure

1. Make sure `.env.local` is in your project directory.
2. Make sure you have both `MES_API_KEY` and `MES_API_KEY` in your `.env.local` file. 🚨 These two settings will be skipped during syncing.

```
MES_API_KEY=<monogram-env-api-key>
MES_PROJECT_ID=<monogram-env-api-key>
```

### Run

Run it manually

```sh
mes
```

Add to your project like

```json
"scripts": {
  "dev": "mes && next dev -p 3007",
  ...
}
```
