# Campus Guide

## Current State
Full-stack campus guide app with 6 tabs: Map, Search, Scan, Courses, Colleges, Admin.
- Colleges tab: searchable directory of college entries stored on-chain; users can register their college after signing in with Internet Identity; HIT is pre-loaded as seed data.
- Admin tab: Internet Identity login; only designated admins can manage locations, courses, campus college info, and the college directory.
- Backend: Motoko with locations, courses, collegeInfo, collegeEntries, userProfiles, roles (admin/user/guest).
- No AI chatbot exists.

## Requested Changes (Diff)

### Add
1. **unirank college seed data** -- Pre-load top 100 Indian universities from unirank.org (rank, name, city/state) as read-only reference entries in the Colleges tab, separate from the user-managed directory. Displayed as a "University Rankings" section in the Colleges tab with rank badge, name, and city. These are static frontend-only data (not stored in backend).
2. **Student Sign In tab** -- New bottom-nav tab "Students" replacing "Admin". Shows two sign-in options: Student and Management. After Internet Identity login, the app determines role: management (can register/manage own college) or student (can bookmark colleges, view profile). Students see a profile page with their name and saved/bookmarked colleges.
3. **Management Sign In flow** -- When a management-role user signs in on the Sign In tab, they see their own college entries with add/edit/delete controls (same form as existing CollegeForm in CollegesTab). Campus admin features (locations, courses, college info) move here under an "Admin" sub-section shown only to admin-role users.
4. **Live AI Chatbot** -- A floating chat button on all tabs. Opens a chat sheet/drawer with a conversational AI assistant that answers questions about colleges, courses, campus navigation, and general university admission queries. The chatbot uses a rule-based / keyword-matching approach on the frontend (no external API calls) with pre-programmed responses about:
   - Campus navigation (buildings, rooms, labs)
   - College search and comparison
   - Course fees and eligibility
   - Admission processes
   - General FAQ about the app
   The chatbot is entirely frontend-based with smart canned responses and keyword matching.
5. **Backend: chatMessage storage** -- Optional: store chat sessions per user in the backend so management users can review FAQ patterns.

### Modify
- **App.tsx**: Replace "admin" tab with "signin" tab. Rename tab label from "Admin" to "Sign In". Keep all 6 tabs (Map, Search, Scan, Courses, Colleges, Sign In).
- **CollegesTab**: Add a "Rankings" section at the top showing the unirank top-100 list as horizontal scrollable cards or a ranked list, separate from the community-registered colleges below.
- **Sign In tab (was Admin tab)**: Show two role cards -- "I'm a Student" and "I'm a College Manager". Both trigger Internet Identity login. Post-login, role is detected from backend (admin/user/guest). Managers see their college management panel. Students see their profile + bookmarked colleges.

### Remove
- AdminTab.tsx as a dedicated tab (its functionality moves into the new SignIn/Account tab).

## Implementation Plan
1. Create `src/frontend/src/data/uniRankColleges.ts` with top 100 Indian universities from unirank data (rank, name, city, state as static array).
2. Generate updated Motoko backend adding: `bookmarkCollege(id: bigint)`, `unbookmarkCollege(id: bigint)`, `getBookmarkedColleges()` for student users; `sendChatMessage(message: string): Promise<string>` as a simple echo/FAQ responder.
3. Replace AdminTab with new `SignInTab.tsx` that handles: unauthenticated state (two role-select cards), authenticated student state (profile + bookmarks), authenticated management state (college management form), authenticated admin state (full admin panel for locations/courses/college info).
4. Update `App.tsx` to swap "admin" tab for "signin" tab.
5. Add unirank rankings section to `CollegesTab.tsx`.
6. Create `AIChatBot.tsx` floating component with keyword-matching chatbot covering campus navigation, courses, colleges, and app FAQ. Mount it in App.tsx so it's available on all tabs.
