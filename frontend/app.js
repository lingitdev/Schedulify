document.addEventListener('DOMContentLoaded', () => {
  const LEVEL_CONFIGS = {
    ilkokul: {
      grades: [1, 2, 3, 4],
      subjects: [
        { value: 'hayat_bilgisi', label: 'Hayat Bilgisi' },
        { value: 'turkce', label: 'Türkçe' },
        { value: 'matematik', label: 'Matematik' },
        { value: 'fen', label: 'Fen Bilimleri' },
        { value: 'gorsel', label: 'Görsel Sanatlar' },
        { value: 'muzik', label: 'Müzik' },
        { value: 'beden', label: 'Oyun ve Fiziki Etkinlikler' },
        { value: 'ingilizce', label: 'İngilizce' }
      ]
    },
    ortaokul: {
      grades: [5, 6, 7, 8],
      subjects: [
        { value: 'matematik', label: 'Matematik' },
        { value: 'turkce', label: 'Türkçe' },
        { value: 'fen', label: 'Fen Bilimleri' },
        { value: 'sosyal', label: 'Sosyal Bilgiler' },
        { value: 'ingilizce', label: 'İngilizce' },
        { value: 'din', label: 'Din Kültürü' },
        { value: 'gorsel', label: 'Görsel Sanatlar' },
        { value: 'muzik', label: 'Müzik' },
        { value: 'beden', label: 'Beden Eğitimi' },
        { value: 'bilisim', label: 'Bilişim Teknolojileri' }
      ]
    },
    lise: {
      grades: [9, 10, 11, 12],
      subjects: [
        { value: 'matematik', label: 'Matematik' },
        { value: 'turk_dili', label: 'Türk Dili ve Edebiyatı' },
        { value: 'fizik', label: 'Fizik' },
        { value: 'kimya', label: 'Kimya' },
        { value: 'biyoloji', label: 'Biyoloji' },
        { value: 'tarih', label: 'Tarih' },
        { value: 'cografya', label: 'Coğrafya' },
        { value: 'ingilizce', label: 'İngilizce' },
        { value: 'felsefe', label: 'Felsefe' },
        { value: 'din', label: 'Din Kültürü' }
      ]
    }
  };

  const schoolLevelRadios = document.querySelectorAll('input[name="school-level"]');
  const gradesContainer = document.getElementById('grades-container');
  const subjectsContainer = document.getElementById('subjects-container');
  const sectionsContainer = document.getElementById('sections-container');

  const daysCountInput = document.getElementById('day-count');
  const hoursCountInput = document.getElementById('hour-count');

  const teacherSubjectSelect = document.getElementById('teacher-subject');
  const teacherNameInput = document.getElementById('teacher-name');
  const addTeacherBtn = document.querySelector('.teacher-form button');
  const teacherTableBody = document.getElementById('teacher-table-body');
  const curriculumContainer = document.getElementById('curriculum-container');

  const batchGradeSelect = document.getElementById('batch-grade-select');
  const batchSubjectSelect = document.getElementById('batch-subject-select');
  const batchHoursInput = document.getElementById('batch-hours-input');
  const btnBatchApply = document.getElementById('btn-batch-apply');

  const btnGenerateSchedule = document.getElementById('btn-generate-schedule');
  const resultCard = document.getElementById('result-card');
  const scheduleResultsContainer = document.getElementById('schedule-results-container');

  let teachers = [];
  let nextTeacherId = 101;
  let curriculumMap = {};

  function loadLevelConfig(levelKey) {
    const config = LEVEL_CONFIGS[levelKey];
    if (!config) return;

    gradesContainer.innerHTML = '';
    batchGradeSelect.innerHTML = '<option value="ALL">Tüm Sınıf Seviyeleri</option>';

    config.grades.forEach(g => {
      const lbl = document.createElement('label');
      lbl.className = 'checkbox-control';
      lbl.innerHTML = `<input type="checkbox" value="${g}" checked> ${g}. Sınıf`;
      gradesContainer.appendChild(lbl);

      const opt = document.createElement('option');
      opt.value = g;
      opt.textContent = `Tüm ${g}. Sınıflar`;
      batchGradeSelect.appendChild(opt);
    });

    subjectsContainer.innerHTML = '';
    config.subjects.forEach(s => {
      const lbl = document.createElement('label');
      lbl.className = 'checkbox-control';
      lbl.innerHTML = `<input type="checkbox" value="${s.value}" checked> ${s.label}`;
      subjectsContainer.appendChild(lbl);
    });

    curriculumMap = {};
    attachDynamicCheckboxEvents();
    syncSubjectSelect();
    renderTeacherTable();
    renderCurriculumMatrix();
  }

  function attachDynamicCheckboxEvents() {
    const gradeCheckboxes = gradesContainer.querySelectorAll('input[type="checkbox"]');
    const subjectCheckboxes = subjectsContainer.querySelectorAll('input[type="checkbox"]');
    const sectionCheckboxes = sectionsContainer.querySelectorAll('input[type="checkbox"]');

    gradeCheckboxes.forEach(cb => cb.addEventListener('change', renderCurriculumMatrix));
    sectionCheckboxes.forEach(cb => cb.addEventListener('change', renderCurriculumMatrix));
    subjectCheckboxes.forEach(cb => cb.addEventListener('change', () => {
      syncSubjectSelect();
      renderCurriculumMatrix();
    }));
  }

  function getSelectedClasses() {
    const grades = Array.from(gradesContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    const sections = Array.from(sectionsContainer.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
    const classes = [];
    grades.forEach(g => sections.forEach(s => classes.push(`${g}-${s}`)));
    return classes;
  }

  function getSelectedSubjects() {
    return Array.from(subjectsContainer.querySelectorAll('input[type="checkbox"]:checked'))
      .map(cb => ({
        value: cb.value,
        label: cb.parentElement.textContent.trim()
      }));
  }

  function syncSubjectSelect() {
    const selectedSubjects = getSelectedSubjects();
    teacherSubjectSelect.innerHTML = '';
    batchSubjectSelect.innerHTML = '';

    if (selectedSubjects.length === 0) {
      const defaultOpt = document.createElement('option');
      defaultOpt.value = '';
      defaultOpt.textContent = 'Ders Bulunamadı';
      defaultOpt.disabled = true;
      defaultOpt.selected = true;
      teacherSubjectSelect.appendChild(defaultOpt);
      batchSubjectSelect.appendChild(defaultOpt.cloneNode(true));
      return;
    }

    const placeholderOpt = document.createElement('option');
    placeholderOpt.value = '';
    placeholderOpt.textContent = 'Ders seçiniz...';
    placeholderOpt.disabled = true;
    placeholderOpt.selected = true;

    teacherSubjectSelect.appendChild(placeholderOpt);
    batchSubjectSelect.appendChild(placeholderOpt.cloneNode(true));

    selectedSubjects.forEach(subject => {
      const option = document.createElement('option');
      option.value = subject.value;
      option.textContent = subject.label;
      teacherSubjectSelect.appendChild(option);
      batchSubjectSelect.appendChild(option.cloneNode(true));
    });
  }

  function handleAddTeacher() {
    const name = teacherNameInput.value.trim();
    const subjectValue = teacherSubjectSelect.value;
    const subjectLabel = teacherSubjectSelect.options[teacherSubjectSelect.selectedIndex]?.text;

    if (!name || !subjectValue) {
      alert('Lütfen öğretmen adını ve branşını eksiksiz doldurun.');
      return;
    }

    teachers.push({
      id: `t_${nextTeacherId++}`,
      name: name,
      subjectKey: subjectValue,
      subjectName: subjectLabel
    });

    renderTeacherTable();
    renderCurriculumMatrix();

    teacherNameInput.value = '';
    teacherSubjectSelect.value = '';
    teacherNameInput.focus();
  }

  function handleDeleteTeacher(id) {
    teachers = teachers.filter(t => t.id !== id);
    Object.keys(curriculumMap).forEach(className => {
      Object.keys(curriculumMap[className]).forEach(subjKey => {
        if (curriculumMap[className][subjKey].teacherId === id) {
          curriculumMap[className][subjKey].teacherId = '';
        }
      });
    });

    renderTeacherTable();
    renderCurriculumMatrix();
  }

  function renderTeacherTable() {
    teacherTableBody.innerHTML = '';
    if (teachers.length === 0) {
      teacherTableBody.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 16px;">
            Henüz öğretmen eklenmedi.
          </td>
        </tr>`;
      return;
    }

    teachers.forEach(teacher => {
      const tr = document.createElement('tr');
      tr.dataset.id = teacher.id;
      tr.innerHTML = `
        <td>#${teacher.id}</td>
        <td>${escapeHtml(teacher.name)}</td>
        <td>${escapeHtml(teacher.subjectName)}</td>
        <td style="text-align: center;">
          <button type="button" class="btn btn-danger btn-sm js-delete-btn">Sil</button>
        </td>
      `;
      teacherTableBody.appendChild(tr);
    });
  }

  function renderCurriculumMatrix() {
    const classes = getSelectedClasses();
    const subjects = getSelectedSubjects();

    if (classes.length === 0 || subjects.length === 0) {
      curriculumContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: var(--text-muted);">
          Matrisin oluşması için en az bir sınıf/şube ve bir ders seçmelisiniz.
        </div>`;
      return;
    }

    let tableHtml = `
      <table class="data-table matrix-table">
        <thead>
          <tr>
            <th style="width: 100px; position: sticky; left: 0; background: #f8fafc; z-index: 2;">Sınıf</th>
    `;

    subjects.forEach(subj => {
      const matchingTeachers = teachers.filter(t => t.subjectKey === subj.value);
      let columnSelectHtml = `<option value="">Toplu Atan</option>`;
      matchingTeachers.forEach(t => {
        columnSelectHtml += `<option value="${t.id}">${escapeHtml(t.name)}</option>`;
      });

      tableHtml += `
        <th>
          <div class="column-header-container">
            <span>${escapeHtml(subj.label)}</span>
            <select data-subject="${subj.value}" class="column-bulk-select js-column-bulk-assign">
              ${columnSelectHtml}
            </select>
          </div>
        </th>
      `;
    });

    tableHtml += `</tr></thead><tbody>`;

    classes.forEach(className => {
      if (!curriculumMap[className]) curriculumMap[className] = {};

      tableHtml += `<tr><td style="position: sticky; left: 0; background: #ffffff; z-index: 1; font-weight: 600;">${className}</td>`;

      subjects.forEach(subj => {
        if (!curriculumMap[className][subj.value]) {
          curriculumMap[className][subj.value] = { hours: 0, teacherId: '' };
        }

        const cellData = curriculumMap[className][subj.value];
        const matchingTeachers = teachers.filter(t => t.subjectKey === subj.value);

        let teacherOptions = `<option value="">-- Öğretmen --</option>`;
        matchingTeachers.forEach(t => {
          const selected = cellData.teacherId === t.id ? 'selected' : '';
          teacherOptions += `<option value="${t.id}" ${selected}>${escapeHtml(t.name)}</option>`;
        });

        tableHtml += `
          <td>
            <div class="matrix-cell">
              <input 
                type="number" min="0" max="20" placeholder="Saat"
                value="${cellData.hours || ''}"
                data-class="${className}" data-subject="${subj.value}"
                class="js-hours-input"
              >
              <select data-class="${className}" data-subject="${subj.value}" class="js-teacher-select">
                ${teacherOptions}
              </select>
            </div>
          </td>
        `;
      });
      tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;
    curriculumContainer.innerHTML = tableHtml;
  }

  function handleBatchApply() {
    const targetGrade = batchGradeSelect.value;
    const targetSubject = batchSubjectSelect.value;
    const hours = parseInt(batchHoursInput.value, 10);

    if (!targetSubject || isNaN(hours) || hours < 0) {
      alert('Lütfen dersi ve geçerli ders saatini girin.');
      return;
    }

    const classes = getSelectedClasses();
    classes.forEach(className => {
      const grade = className.split('-')[0];
      if (targetGrade === 'ALL' || targetGrade === grade) {
        if (!curriculumMap[className]) curriculumMap[className] = {};
        if (!curriculumMap[className][targetSubject]) curriculumMap[className][targetSubject] = { hours: 0, teacherId: '' };
        curriculumMap[className][targetSubject].hours = hours;
      }
    });

    renderCurriculumMatrix();
  }

  function handleColumnBulkAssign(subjectKey, teacherId) {
    if (!teacherId) return;
    const classes = getSelectedClasses();

    classes.forEach(className => {
      if (!curriculumMap[className]) curriculumMap[className] = {};
      if (!curriculumMap[className][subjectKey]) {
        curriculumMap[className][subjectKey] = { hours: 0, teacherId: '' };
      }
      curriculumMap[className][subjectKey].teacherId = teacherId;
    });

    renderCurriculumMatrix();
  }

  function getActiveCurriculum() {
    const activeCurriculum = {};
    const selectedClasses = getSelectedClasses();

    selectedClasses.forEach(className => {
      if (curriculumMap[className]) {
        let classTotalHours = 0;
        const filteredSubjects = {};

        Object.keys(curriculumMap[className]).forEach(subjKey => {
          const subjData = curriculumMap[className][subjKey];
          const hours = parseInt(subjData.hours, 10) || 0;
          if (hours > 0) {
            classTotalHours += hours;
            filteredSubjects[subjKey] = subjData;
          }
        });

        if (classTotalHours > 0) {
          activeCurriculum[className] = filteredSubjects;
        }
      }
    });

    return activeCurriculum;
  }

  function validateScheduleCapacity(activeCurriculum) {
    const days = parseInt(daysCountInput.value, 10) || 5;
    const hours = parseInt(hoursCountInput.value, 10) || 8;
    const capacity = days * hours;
    const warnings = [];

    Object.keys(activeCurriculum).forEach(className => {
      let totalHours = 0;
      Object.values(activeCurriculum[className]).forEach(subjData => {
        totalHours += parseInt(subjData.hours, 10) || 0;
      });

      if (totalHours !== capacity) {
        warnings.push(`- ${className} Sınıfı: Toplam ${totalHours} saat (Haftalık Kapasite: ${capacity} saat)`);
      }
    });

    if (warnings.length > 0) {
      const message = `DIKKAT: Bazı aktif sınıfların ders saatleri haftalık okul kapasitesine eşit değil!\n\n` +
                      warnings.join('\n') +
                      `\n\nYine de devam etmek istiyor musunuz?`;
      return confirm(message);
    }

    return true;
  }

  async function handleGenerateSchedule() {
    const activeCurriculum = getActiveCurriculum();

    if (Object.keys(activeCurriculum).length === 0) {
      alert('Lütfen en az bir sınıfa ait en az bir derse saat giriniz.');
      return;
    }

    if (!validateScheduleCapacity(activeCurriculum)) {
      return;
    }

    const payload = {
      daysCount: parseInt(daysCountInput.value, 10) || 5,
      hoursCount: parseInt(hoursCountInput.value, 10) || 8,
      teachers: teachers,
      curriculum: activeCurriculum
    };

    btnGenerateSchedule.disabled = true;
    btnGenerateSchedule.textContent = 'Program Çözülüyor...';

    try {
      const response = await fetch('/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.status === 'success') {
        renderScheduleResults(result);
        resultCard.style.display = 'block';
        resultCard.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert(result.message || 'Hata oluştu.');
      }
    } catch (err) {
      alert('Sunucu ile iletişim kurulurken bir hata oluştu.');
      console.error(err);
    } finally {
      btnGenerateSchedule.disabled = false;
      btnGenerateSchedule.textContent = 'Ders Programını Oluştur';
    }
  }

  function renderScheduleResults(data) {
    const { schedule, days, hours } = data;
    let html = '';

    Object.keys(schedule).forEach(className => {
      html += `<h3 style="margin: 20px 0 10px; color: var(--primary);">${className} Sınıfı Programı</h3>`;
      html += `<div class="table-wrapper"><table class="data-table"><thead><tr><th>Saat</th>`;

      days.forEach(day => {
        html += `<th>${day}</th>`;
      });
      html += `</tr></thead><tbody>`;

      hours.forEach((hourLabel, hIdx) => {
        html += `<tr><td><strong>${hourLabel}</strong></td>`;
        days.forEach(day => {
          const slot = schedule[className][day][hIdx];
          if (slot) {
            html += `<td>
              <div style="font-weight:600;">${escapeHtml(slot.subject.toUpperCase())}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(slot.teacher_name)}</div>
            </td>`;
          } else {
            html += `<td style="color:var(--text-muted); font-style:italic;">Boş</td>`;
          }
        });
        html += `</tr>`;
      });

      html += `</tbody></table></div>`;
    });

    scheduleResultsContainer.innerHTML = html;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, match => {
      const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
      return escapeMap[match];
    });
  }

  schoolLevelRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      loadLevelConfig(e.target.value);
    });
  });

  addTeacherBtn.addEventListener('click', handleAddTeacher);
  btnBatchApply.addEventListener('click', handleBatchApply);
  btnGenerateSchedule.addEventListener('click', handleGenerateSchedule);

  teacherTableBody.addEventListener('click', (e) => {
    if (e.target.classList.contains('js-delete-btn')) {
      const tr = e.target.closest('tr');
      if (tr && tr.dataset.id) handleDeleteTeacher(tr.dataset.id);
    }
  });

  curriculumContainer.addEventListener('change', (e) => {
    if (e.target.classList.contains('js-column-bulk-assign')) {
      const subjectKey = e.target.dataset.subject;
      const teacherId = e.target.value;
      handleColumnBulkAssign(subjectKey, teacherId);
    } else if (e.target.classList.contains('js-teacher-select')) {
      const { class: c, subject: s } = e.target.dataset;
      if (curriculumMap[c] && curriculumMap[c][s]) {
        curriculumMap[c][s].teacherId = e.target.value;
      }
    }
  });

  curriculumContainer.addEventListener('input', (e) => {
    if (e.target.classList.contains('js-hours-input')) {
      const { class: c, subject: s } = e.target.dataset;
      if (curriculumMap[c] && curriculumMap[c][s]) {
        curriculumMap[c][s].hours = parseInt(e.target.value, 10) || 0;
      }
    }
  });

  loadLevelConfig('ortaokul');
});