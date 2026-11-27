# Monthly database backups

The `Monthly database backup to Google Drive` workflow runs on the first day of each month at 03:15 UTC. It is prepared but stays disabled until `GOOGLE_DRIVE_BACKUPS_ENABLED=true` is set as a GitHub repository variable.

The archive contains the PostgreSQL database, including orders, products, stock, customers, translations and CMS settings. Uploaded image files on Azure persistent storage are not included in this database dump. The repository contains the checked-in storefront images.

## Activate once the Drive folder is supplied

1. Enable the Google Drive API in the Google Cloud project and create an OAuth client. Authorize the Google account that owns the backup folder with offline access and the `https://www.googleapis.com/auth/drive.file` scope. Ensure the folder is accessible to the app (for an existing folder not created/selected through the app, authorization may require the full Drive scope). Use a production OAuth consent configuration; testing refresh tokens can expire after seven days.
2. In repository **Settings → Secrets and variables → Actions**, add `GOOGLE_DRIVE_ID` (the folder ID), `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, and `GOOGLE_DRIVE_REFRESH_TOKEN`. Keep these values out of chat and version control. Existing `DATABASE_URL` and `DATABASE_CA_CERT_BASE64` secrets are reused.
3. Run the workflow manually from **Actions**. It validates the gzip and PostgreSQL archive, uploads it, and checks the uploaded size and MD5 checksum. A failed backup/upload fails the job; temporary archives are removed afterward. No database archive is published as a GitHub artifact.
4. After the first successful upload, set the repository variable `GOOGLE_DRIVE_BACKUPS_ENABLED` to `true` to activate the monthly schedule.

Drive backups accumulate without automatic deletion. Local backups keep the latest 12 archives. The schedule follows UTC so its Casablanca local hour can change during Ramadan.

## Local backup

Run `npm run backup:local`. The archive is saved in the ignored `backups/` directory. To upload an existing backup with credentials configured in the shell, run `npm run backup:drive -- /absolute/path/to/monadaty-backup-....sql.gz`.

## Restore

Use `scripts/restore-db.ts` with the intended database URL and CA configuration only after reviewing the destination. Restoration changes database data. Practice restoring into a separate database before relying on a backup.

References: [Google Drive uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads), [offline OAuth access](https://developers.google.com/identity/protocols/oauth2/web-server#offline).
