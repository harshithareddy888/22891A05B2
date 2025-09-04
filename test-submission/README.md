# Backend/Frontend Test Submission

Use this folder to store everything required to submit your app for review/testing.

It is split into `frontend/` and `backend/` so you can provide test plans, manual steps, and any automation scripts separately.

## Structure
- `frontend/`
  - `README.md` — How to run the frontend locally and what to verify.
  - `manual-test-cases.md` — Step-by-step checks to validate the main flows.
- `backend/`
  - `README.md` — If you have a backend, explain how to run it and test it. If not used, keep as placeholder.
  - `api-contract.md` — Document any APIs the frontend expects (even if mocked or proxied during development).

## Quick Start
1. Follow `frontend/README.md` to run the UI.
2. Walk through `frontend/manual-test-cases.md` and check off each scenario.
3. If you have a backend, bring it up following `backend/README.md` and validate your endpoints with the `api-contract.md`.
