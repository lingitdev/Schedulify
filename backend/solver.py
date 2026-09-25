import random
from rules import SoftRulesEngine

class ScheduleSolver:
    def __init__(self, data):
        self.days_count = int(data.get("daysCount", 5))
        self.hours_count = int(data.get("hoursCount", 8))
        self.curriculum = data.get("curriculum", {})
        self.teachers = {t["id"]: t["name"] for t in data.get("teachers", [])}
        self.custom_rules = data.get("customRules", [])
        
        self.rules_engine = SoftRulesEngine(self.days_count, self.hours_count)
        self.classes = list(self.curriculum.keys())
        self.days = [f"Gün {i+1}" for i in range(self.days_count)]
        self.hours = [f"{i+1}. Saat" for i in range(self.hours_count)]

    def solve(self):
        schedule = {c: {d: [None] * self.hours_count for d in self.days} for c in self.classes}
        tasks = []

        for class_name, subjects in self.curriculum.items():
            for subj_key, subj_data in subjects.items():
                hours = int(subj_data.get("hours", 0))
                teacher_id = subj_data.get("teacherId", "")
                if hours > 0 and teacher_id:
                    created_tasks = self.rules_engine.create_blocks(
                        class_name, subj_key, hours, teacher_id
                    )
                    tasks.extend(created_tasks)

        tasks.sort(key=lambda x: x["size"], reverse=True)

        if self._backtrack(tasks, 0, schedule):
            return {
                "status": "success",
                "schedule": schedule,
                "days": self.days,
                "hours": self.hours
            }
        else:
            return {
                "status": "error",
                "message": "Çakışmasız program oluşturulamadı. Ders saatlerini veya öğretmen dağılımını gözden geçirin."
            }

    def _backtrack(self, tasks, task_idx, schedule):
        if task_idx >= len(tasks):
            return True

        task = tasks[task_idx]
        c_name = task["class_name"]
        t_id = task["teacher_id"]
        block_size = task["size"]

        day_indices = list(range(self.days_count))
        random.shuffle(day_indices)

        for day_idx in day_indices:
            day = self.days[day_idx]

            if not self.rules_engine.is_day_allowed(task["subject"], day_idx, self.custom_rules):
                continue

            if self.rules_engine.is_subject_already_in_day(schedule, c_name, task["subject"], day):
                continue

            if block_size == 2:
                for hour_idx in range(self.hours_count - 1):
                    if self._can_place_block(c_name, t_id, day, hour_idx, 2, schedule):
                        self._apply_block(c_name, task, day, hour_idx, 2, schedule)
                        if self._backtrack(tasks, task_idx + 1, schedule):
                            return True
                        self._remove_block(c_name, day, hour_idx, 2, schedule)

            elif block_size == 1:
                for hour_idx in range(self.hours_count):
                    if self._can_place_block(c_name, t_id, day, hour_idx, 1, schedule):
                        self._apply_block(c_name, task, day, hour_idx, 1, schedule)
                        if self._backtrack(tasks, task_idx + 1, schedule):
                            return True
                        self._remove_block(c_name, day, hour_idx, 1, schedule)

        return False

    def _can_place_block(self, c_name, teacher_id, day, start_hour, size, schedule):
        for offset in range(size):
            h_idx = start_hour + offset
            if h_idx >= self.hours_count:
                return False
            if schedule[c_name][day][h_idx] is not None:
                return False
            if self._is_teacher_busy(teacher_id, day, h_idx, schedule):
                return False
        return True

    def _apply_block(self, c_name, task, day, start_hour, size, schedule):
        for offset in range(size):
            h_idx = start_hour + offset
            schedule[c_name][day][h_idx] = {
                "subject": task["subject"],
                "teacher_id": task["teacher_id"],
                "teacher_name": self.teachers.get(task["teacher_id"], "Atanmadı")
            }

    def _remove_block(self, c_name, day, start_hour, size, schedule):
        for offset in range(size):
            h_idx = start_hour + offset
            schedule[c_name][day][h_idx] = None

    def _is_teacher_busy(self, teacher_id, day, hour_idx, schedule):
        for c_name in self.classes:
            slot = schedule[c_name][day][hour_idx]
            if slot and slot["teacher_id"] == teacher_id:
                return True
        return False