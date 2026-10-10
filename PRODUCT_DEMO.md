# StudySync — Product Demo Summary

University students constantly juggle study groups, exam preparation, assignments, and a social
life, but their academic work is scattered across group chats, calendars, personal task lists, and
file folders. This fragmentation makes it hard to know what actually needs to be done, when it is
due, and where the relevant material lives. StudySync solves this coordination and organization
problem by providing a single, calm workspace where students can organize their courses, track study
tasks, keep useful resources, and see their overall progress at a glance. The intended users are
university students — especially those working in study groups or handling several courses at once —
who want to reduce the time they waste searching for information and coordinating with others.

The most important user flow begins on the public landing page, where a visitor learns what
StudySync is and signs up for a free account. After signing up or logging in, the student lands on
an authenticated dashboard that immediately answers the question "what do I need to study and what
is left to complete?" It shows the number of courses, active and completed tasks, an overall
completion percentage, and a list of upcoming tasks. From there, the student creates a course, opens
its dedicated workspace, and adds tasks with due dates and statuses (Not Started, In Progress,
Completed) as well as study resources such as links and uploaded files. They can attach files (with
image thumbnails, file-type badges, and favicon previews for links), add study partners to the course
from a searchable list of existing accounts, and collaborate in real time — tasks, resources, and
members update live for everyone in the group. They can update task statuses as work progresses and
edit or delete anything they no longer need — all backed by a MongoDB database through Next.js API
routes.

The core value StudySync provides is relief from academic disorganization: one organized place that
removes coordination overhead and gives students a clear, real-time picture of their coursework.
Because it demonstrates a complete client → API route → database flow with authentication, full CRUD
on multiple data models, file uploads, course sharing, live Server-Sent Events, and a consistent
responsive design, it also serves as a solid foundation for future features such as OAuth sign-in,
durable multi-instance real-time, object storage, and due-date reminders.
