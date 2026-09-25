class SoftRulesEngine:
    def __init__(self, days_count=5, hours_count=8):
        self.days_count = days_count
        self.hours_count = hours_count

    def create_blocks(self, class_name, subject, hours, teacher_id):
        tasks = []
        num_blocks = hours // 2
        rem_single = hours % 2

        for _ in range(num_blocks):
            tasks.append({
                "class_name": class_name,
                "subject": subject,
                "teacher_id": teacher_id,
                "size": 2
            })

        if rem_single == 1:
            tasks.append({
                "class_name": class_name,
                "subject": subject,
                "teacher_id": teacher_id,
                "size": 1
            })

        return tasks

    def is_day_allowed(self, subject, day_idx, custom_rules=None):
        if not custom_rules:
            return True

        for rule in custom_rules:
            if rule.get("subject") == subject:
                target_day = rule.get("day_idx")
                condition = rule.get("condition")
                if condition == "DENY" and day_idx == target_day:
                    return False
                if condition == "ALLOW" and day_idx != target_day:
                    return False

        return True

    def is_subject_already_in_day(self, schedule, class_name, subject, day):
        for slot in schedule[class_name][day]:
            if slot and slot["subject"] == subject:
                return True
        return False