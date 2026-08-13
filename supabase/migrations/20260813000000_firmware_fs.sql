-- firmware filesystem image: the base firmware is published as two files
-- (app .bin + LittleFS image with the config portal and default prefs).
-- fs_size records the size of the filesystem image in storage:
--   cartridges/firmware/<id>-fs.bin  (derived from the row id)

alter table firmware
  add column if not exists fs_size integer not null default 0;
