#!/usr/bin/env python3
"""
Cross-platform (Windows/Linux) simple GUI to edit GPS test client parameters.
Displays fields:
 - lat (default 41.5565278)
 - lng (default -8.4048611)
 - heartbeat_freq (seconds, editable)
 - update_freq (seconds, editable)
 - heartbeat (checkbox)
 - update (checkbox)

Usage:
  python scripts/gps_client_gui.py

Works with the stdlib tkinter (installed by default with CPython on most platforms).
"""

import sys
import threading
import time
import json
import urllib.request
import urllib.error
import tkinter as tk
from tkinter import ttk, messagebox
import random

DEFAULT_LAT = 41.5565278
DEFAULT_LNG = -8.4048611
DEFAULT_HEARTBEAT_FREQ = 1
DEFAULT_UPDATE_FREQ = 1
DEFAULT_ERROR_RADIUS = 0.0005


class GPSClientGUI:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("GPS Test Client")
        self.root.resizable(False, False)

        main = ttk.Frame(root, padding=12)
        main.grid(row=0, column=0, sticky=(tk.N, tk.S, tk.E, tk.W))

        # Lat / Lng
        lat_label = ttk.Label(main, text="Latitude:")
        lat_label.grid(row=0, column=0, sticky=tk.W, pady=4)
        self.lat_var = tk.StringVar(value=str(DEFAULT_LAT))
        lat_entry = ttk.Entry(main, textvariable=self.lat_var, width=20)
        lat_entry.grid(row=0, column=1, sticky=tk.W, pady=4)

        lng_label = ttk.Label(main, text="Longitude:")
        lng_label.grid(row=1, column=0, sticky=tk.W, pady=4)
        self.lng_var = tk.StringVar(value=str(DEFAULT_LNG))
        lng_entry = ttk.Entry(main, textvariable=self.lng_var, width=20)
        lng_entry.grid(row=1, column=1, sticky=tk.W, pady=4)

        # Frequencies
        hb_label = ttk.Label(main, text="heartbeat_freq (s):")
        hb_label.grid(row=2, column=0, sticky=tk.W, pady=4)
        self.hb_var = tk.StringVar(value=str(DEFAULT_HEARTBEAT_FREQ))
        hb_entry = ttk.Entry(main, textvariable=self.hb_var, width=20)
        hb_entry.grid(row=2, column=1, sticky=tk.W, pady=4)
        # when heartbeat frequency changes, reflect in schedule
        self.hb_var.trace_add('write', lambda *args: self._on_hb_freq_changed())

        up_label = ttk.Label(main, text="update_freq (s):")
        up_label.grid(row=3, column=0, sticky=tk.W, pady=4)
        self.up_var = tk.StringVar(value=str(DEFAULT_UPDATE_FREQ))
        up_entry = ttk.Entry(main, textvariable=self.up_var, width=20)
        up_entry.grid(row=3, column=1, sticky=tk.W, pady=4)
        # when update frequency changes, reflect in schedule
        self.up_var.trace_add('write', lambda *args: self._on_up_freq_changed())

        # Error radius for lat/lng and randomness toggles
        err_label = ttk.Label(main, text="raio de erro (lat/lng):")
        err_label.grid(row=4, column=0, sticky=tk.W, pady=4)
        self.error_radius_var = tk.StringVar(value=str(DEFAULT_ERROR_RADIUS))
        err_entry = ttk.Entry(main, textvariable=self.error_radius_var, width=20)
        err_entry.grid(row=4, column=1, sticky=tk.W, pady=4)

        self.randomize_lat_enabled = tk.BooleanVar(value=False)
        rand_lat_check = ttk.Checkbutton(main, text="enable lat randomness", variable=self.randomize_lat_enabled)
        rand_lat_check.grid(row=5, column=0, sticky=tk.W, pady=(8, 4))

        self.randomize_lng_enabled = tk.BooleanVar(value=False)
        rand_lng_check = ttk.Checkbutton(main, text="enable lng randomness", variable=self.randomize_lng_enabled)
        rand_lng_check.grid(row=5, column=1, sticky=tk.W, pady=(8, 4))

        # Checkboxes
        self.heartbeat_enabled = tk.BooleanVar(value=True)
        hb_check = ttk.Checkbutton(
            main,
            text="heartbeat",
            variable=self.heartbeat_enabled,
            command=lambda: self._on_heartbeat_toggled(),
        )
        hb_check.grid(row=6, column=0, sticky=tk.W, pady=(8, 4))

        self.update_enabled = tk.BooleanVar(value=True)
        up_check = ttk.Checkbutton(
            main,
            text="update",
            variable=self.update_enabled,
            command=lambda: self._on_update_toggled(),
        )
        up_check.grid(row=6, column=1, sticky=tk.W, pady=(8, 4))

        # Buttons
        btn_frame = ttk.Frame(main)
        btn_frame.grid(row=7, column=0, columnspan=2, pady=(8, 0))

        show_btn = ttk.Button(btn_frame, text="Show config", command=self.show_config)
        show_btn.grid(row=0, column=0, padx=(0, 8))

        copy_btn = ttk.Button(btn_frame, text="Copy as JSON", command=self.copy_json)
        copy_btn.grid(row=0, column=1, padx=(0, 8))

        renew_btn = ttk.Button(btn_frame, text="Renew ID", command=self.renew_id)
        renew_btn.grid(row=0, column=2, padx=(0, 8))

        fetch_btn = ttk.Button(btn_frame, text="Fetch entries", command=self.fetch_entries)
        fetch_btn.grid(row=0, column=4, padx=(0, 8))

        close_btn = ttk.Button(btn_frame, text="Close", command=self.on_close)
        close_btn.grid(row=0, column=3)

        # Keyboard bindings
        root.bind('<Return>', lambda e: self.show_config())

        # Server base URL
        self.base_url = tk.StringVar(value='http://localhost:3000/api/test-gps')
        url_label = ttk.Label(main, text="Server URL:")
        url_label.grid(row=8, column=0, sticky=tk.W, pady=(8, 0))
        url_entry = ttk.Entry(main, textvariable=self.base_url, width=40)
        url_entry.grid(row=8, column=1, sticky=tk.W, pady=(8, 0))

        # Status and current id
        self.status_var = tk.StringVar(value='')
        status_label = ttk.Label(main, textvariable=self.status_var, foreground='blue')
        status_label.grid(row=9, column=0, columnspan=2, sticky=tk.W, pady=(8, 0))

        self.id_var = tk.StringVar(value='')
        id_label = ttk.Label(main, textvariable=self.id_var)
        id_label.grid(row=10, column=0, columnspan=2, sticky=tk.W, pady=(4, 0))

        # run control
        self.running = True
        self._heartbeat_job = None
        self._update_job = None
        self.current_id = None

        # obtain an ID at startup
        self.root.after(100, lambda: self.renew_id())

    def validate(self):
        try:
            lat = float(self.lat_var.get())
            lng = float(self.lng_var.get())
        except ValueError:
            messagebox.showerror("Validation error", "Latitude and longitude must be valid numbers")
            return None

        try:
            hb = float(self.hb_var.get())
            up = float(self.up_var.get())
        except ValueError:
            messagebox.showerror("Validation error", "Frequencies must be valid numbers")
            return None

        try:
            err = float(self.error_radius_var.get())
        except ValueError:
            messagebox.showerror("Validation error", "Raio de erro must be a valid number")
            return None

        if hb <= 0 or up <= 0:
            messagebox.showerror("Validation error", "Frequencies must be positive numbers")
            return None

        if err < 0:
            messagebox.showerror("Validation error", "Raio de erro must be a non-negative number")
            return None

        return {
            "lat": lat,
            "lng": lng,
            "heartbeat_freq": hb,
            "update_freq": up,
            "error_radius": err,
            "randomize_lat": bool(self.randomize_lat_enabled.get()),
            "randomize_lng": bool(self.randomize_lng_enabled.get()),
            "heartbeat": bool(self.heartbeat_enabled.get()),
            "update": bool(self.update_enabled.get()),
        }

    def show_config(self):
        cfg = self.validate()
        if cfg is None:
            return
        # pretty print in a small dialog and to stdout
        import json

        s = json.dumps(cfg, indent=2)
        print(s)
        messagebox.showinfo("Current config", s)

    def copy_json(self):
        cfg = self.validate()
        if cfg is None:
            return
        import json
        s = json.dumps(cfg)
        try:
            self.root.clipboard_clear()
            self.root.clipboard_append(s)
            messagebox.showinfo("Copied", "Configuration copied to clipboard")
        except Exception:
            # Some environments may not support clipboard
            messagebox.showwarning("Clipboard", "Could not access clipboard. Configuration:\n" + s)

    # Networking helpers
    def _set_status(self, text: str):
        def _update():
            self.status_var.set(text)
        self.root.after(0, _update)

    def _http_post(self, path: str, payload: dict, timeout: int = 5):
        url = f"{self.base_url.get().rstrip('/')}/{path.lstrip('/') }"
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={ 'Content-Type': 'application/json' })
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read()
                if not raw:
                    return None
                text = raw.decode('utf-8')
                try:
                    return json.loads(text)
                except Exception:
                    # non-json response
                    return text
        except Exception as e:
            raise

    def _http_get(self, timeout: int = 5):
        url = self.base_url.get().rstrip('/')
        req = urllib.request.Request(url, headers={ 'Accept': 'application/json' })
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                raw = resp.read()
                if not raw:
                    return None
                text = raw.decode('utf-8')
                try:
                    return json.loads(text)
                except Exception:
                    return text
        except Exception as e:
            raise

    def renew_id(self):
        # request new id from server
        def job():
            try:
                self._set_status('Requesting new ID...')
                res = self._http_post('new-gps', { 'lat': float(self.lat_var.get()), 'lng': float(self.lng_var.get()) })
                if res and 'id' in res:
                    self.current_id = res['id']
                    self.root.after(0, lambda: self.id_var.set(f'ID: {self.current_id}'))
                    self._set_status('Obtained new ID')
                    # restart cycles
                    self._schedule_heartbeat()
                    self._schedule_update()
                else:
                    self._set_status('Invalid response when obtaining id')
            except Exception as e:
                self._set_status(f'Error obtaining id: {e}')

        threading.Thread(target=job, daemon=True).start()

    def _schedule_heartbeat(self):
        # cancel existing
        if self._heartbeat_job:
            try:
                self.root.after_cancel(self._heartbeat_job)
            except Exception:
                pass
            self._heartbeat_job = None
        if not self.running:
            return
        cfg = self.validate()
        if cfg is None:
            return
        if not cfg['heartbeat']:
            self._set_status('Heartbeat disabled')
            return
        interval = int(cfg['heartbeat_freq'] * 1000)
        # schedule first immediately
        self._heartbeat_job = self.root.after(0, lambda: self._do_heartbeat(interval))

    def _cancel_heartbeat_job(self):
        if self._heartbeat_job:
            try:
                self.root.after_cancel(self._heartbeat_job)
            except Exception:
                pass
            self._heartbeat_job = None

    def _on_heartbeat_toggled(self):
        # Start or stop heartbeat schedule based on checkbox
        if self.heartbeat_enabled.get():
            self._schedule_heartbeat()
        else:
            self._cancel_heartbeat_job()
            self._set_status('Heartbeat disabled')

    def _do_heartbeat(self, interval_ms: int):
        def job():
            if not self.current_id:
                self._set_status('No ID for heartbeat')
                return
            try:
                self._set_status('Sending heartbeat...')
                res = self._http_post('heartbeat', { 'id': self.current_id })
                self._set_status('Heartbeat ok: ' + time.strftime('%H:%M:%S'))
            except Exception as e:
                self._set_status(f'Heartbeat error: {e}')

        threading.Thread(target=job, daemon=True).start()
        # schedule next
        try:
            self._heartbeat_job = self.root.after(interval_ms, lambda: self._do_heartbeat(interval_ms))
        except Exception:
            self._heartbeat_job = None

    def _schedule_update(self):
        if self._update_job:
            try:
                self.root.after_cancel(self._update_job)
            except Exception:
                pass
            self._update_job = None
        if not self.running:
            return
        cfg = self.validate()
        if cfg is None:
            return
        if not cfg['update']:
            self._set_status('Update disabled')
            return
        interval = int(cfg['update_freq'] * 1000)
        self._update_job = self.root.after(0, lambda: self._do_update(interval))

    def _cancel_update_job(self):
        if self._update_job:
            try:
                self.root.after_cancel(self._update_job)
            except Exception:
                pass
            self._update_job = None

    def _on_update_toggled(self):
        # Start or stop update schedule based on checkbox
        if self.update_enabled.get():
            self._schedule_update()
        else:
            self._cancel_update_job()
            self._set_status('Update disabled')

    def _on_hb_freq_changed(self):
        # Reschedule heartbeat to reflect new frequency if enabled
        if not self.hb_var.get() or self.hb_var.get().strip() == '':
            # Ignore empty (user deleting to change)
            return
        if self.heartbeat_enabled.get():
            self._schedule_heartbeat()

    def _on_up_freq_changed(self):
        # Reschedule update to reflect new frequency if enabled
        if not self.up_var.get() or self.up_var.get().strip() == '':
            # Ignore empty (user deleting to change)
            return
        if self.update_enabled.get():
            self._schedule_update()

    def _do_update(self, interval_ms: int):
        def job():
            if not self.current_id:
                self._set_status('No ID for update')
                return
            try:
                lat = float(self.lat_var.get())
                lng = float(self.lng_var.get())
                # apply randomness if enabled
                try:
                    err = float(self.error_radius_var.get())
                except Exception:
                    err = 0.0
                if self.randomize_lat_enabled.get() and err > 0:
                    lat = lat + random.uniform(-err, err)
                if self.randomize_lng_enabled.get() and err > 0:
                    lng = lng + random.uniform(-err, err)

                self._set_status('Sending update...')
                res = self._http_post('update', { 'id': self.current_id, 'lat': lat, 'lng': lng })
                self._set_status('Update ok: ' + time.strftime('%H:%M:%S') + f' (lat: {lat:.6f}, lng: {lng:.6f})')
            except Exception as e:
                self._set_status(f'Update error: {e}')

        threading.Thread(target=job, daemon=True).start()
        try:
            self._update_job = self.root.after(interval_ms, lambda: self._do_update(interval_ms))
        except Exception:
            self._update_job = None

    def on_close(self):
        self.running = False
        # cancel scheduled
        try:
            if self._heartbeat_job:
                self.root.after_cancel(self._heartbeat_job)
        except Exception:
            pass
        try:
            if self._update_job:
                self.root.after_cancel(self._update_job)
        except Exception:
            pass
        self.root.destroy()

    def fetch_entries(self):
        def job():
            try:
                self._set_status('Fetching entries...')
                res = self._http_get()
                if isinstance(res, dict) and 'gps' in res and 'entries' in res['gps']:
                    entries = res['gps']['entries']
                    self._set_status(f'Fetched {len(entries)} entries')
                    if entries:
                        # pick first entry id as current id
                        first = entries[0]
                        if 'id' in first:
                            self.current_id = first['id']
                            self.root.after(0, lambda: self.id_var.set(f'ID: {self.current_id}'))
                else:
                    self._set_status('Unexpected response from server')
            except Exception as e:
                self._set_status(f'Error fetching entries: {e}')

        threading.Thread(target=job, daemon=True).start()


def main():
    root = tk.Tk()
    style = ttk.Style()
    # Try to set a native theme if available
    try:
        style.theme_use('clam')
    except Exception:
        pass
    app = GPSClientGUI(root)
    root.mainloop()


if __name__ == '__main__':
    main()
