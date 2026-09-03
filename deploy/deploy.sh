#!/usr/bin/bash

sudo install -m 644 -o root -g root ./deploy/h64-scan.service /etc/systemd/system/h64-scan.service

sudo systemctl daemon-reload
sudo systemctl start h64-scan
sudo systemctl enable h64-scan
sudo systemctl status h64-scan