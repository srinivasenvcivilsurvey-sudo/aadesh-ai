#!/bin/bash
# Quick deploy helper — prompts for password then runs deploy_vps.py
cd "$(dirname "$0")"
echo "Enter VPS password for 165.232.176.181:"
read -s VPS_PASS
export VPS_PASS
python deploy_vps.py
