class Calendar {
  constructor({
    container = '',
    activeDateClass = '',
    initialDate = new Date(),
  } = {}) {
    this.$container = container ? document.querySelector(container) : null;
    this.activeDateClass = activeDateClass;

    this.selectedDate = initialDate;
    this.currentMonth = initialDate;
    this.currentMonthDays = [];

    // default events list
    this.idGenerator = 0;
    this.events = { 'events': [
      { id: 1, title: 'Event', year: 2019, month: 2, day: 22},
      { id: 10, title: 'Meetting', year: 2019, month: 2, day: 24},
    ] };

    this.monthsNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    this.daysNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    this.generateMarkup();
    this.initHandlers();
  }

  buildCurrentMonthDays() {
    let currentYear = this.currentMonth.getFullYear();
    let currrentMonth = this.currentMonth.getMonth();
    let firstMonthDay = new Date(currentYear, currrentMonth, 1);
    let lastMonthDay = new Date(currentYear, currrentMonth + 1, 0);

    this.currentMonthDays = [];

    for (let i = -firstMonthDay.getUTCDay(); i < 0; i++) {
      this.currentMonthDays.push(new Date(currentYear, currrentMonth, i));
    }

    for (let i = 1, lastDay = lastMonthDay.getDate(); i <= lastDay; i++) {
      this.currentMonthDays.push(new Date(currentYear, currrentMonth, i));
    }

    for (let i = 1, daysAppend = 7 - lastMonthDay.getUTCDay(); i < daysAppend; i++) {
      this.currentMonthDays.push(new Date(currentYear, currrentMonth + 1, i));
    }
  }

  getDayClass( date ) {
    let classes = ['calendar-item'];
    let currentYear = this.currentMonth.getFullYear();
    let currentMonth = this.currentMonth.getMonth();

    if (date.toDateString() === this.selectedDate.toDateString()) {
      classes = classes.concat(['is-active', this.activeDateClass]);
    }

    if (date.getMonth() === 11 && this.currentMonth.getMonth() === 0) {
      classes.push('calendar-item-prev-month');
    } else if (date.getMonth() === 0 && this.currentMonth.getMonth() === 11) {
      classes.push('calendar-item-next-month');
    } else if (date.getMonth() < this.currentMonth.getMonth()) {
      classes.push('calendar-item-prev-month');
    } else if(date.getMonth() > this.currentMonth.getMonth()) {
      classes.push('calendar-item-next-month');
    }

    return classes.join(' ');
  }

  getFormattedDate( date ) {
    return `${date.getFullYear()} ${this.monthsNames[date.getMonth()]}`;
  }

  generateDaysMarkup() {
    let days = [];

    this.buildCurrentMonthDays();

    this.currentMonthDays.forEach(function(day, index) {
      let hasEvent = this.checkEvents( day ).length;

      days.push(`
        <li data-date="${day.toLocaleDateString()}" class="${this.getDayClass(day)} ${hasEvent ? "has-event" : ''}">${day.getDate()}</li>
      `);
    }.bind(this));

    return days.join('');
  }

  generateEventsMarkup() {
    let events = [];
    let currentEvents = this.checkEvents( this.selectedDate );
    let dayName = this.selectedDate.getDay() === 0 ? dayName = 6 : this.selectedDate.getDay() - 1;

    currentEvents.forEach(function(event) {
      events.push(`
        <li class="event-item" data-id="${event.id}" data-date="${this.selectedDate.toLocaleDateString()}">
          <span class="event-title">${event.title}</span>
          <span class="remove-event"></span>
        </li>
      `);
    }.bind(this));

    return (`
      <div>
        <div class="event-date">
          <span class="event-day">
            ${this.selectedDate.getDate()}
          </span>
          <span class="event-day-name">
            ${this.daysNames[dayName]}
          </span>
        </div>
        <ul>
          ${events && events.join('')}
        </ul>
        ${ events == false ? '<span class="event-warning">There are no appointments</span>' : ''}
      </div>
    `);
  }

  renderApp() {
    this.$container.querySelector('.calendar-days-list').innerHTML = this.generateDaysMarkup();
    this.$container.querySelector('.calendar-header-date').innerHTML = this.getFormattedDate(this.currentMonth);
  }

  renderEvents() {
    let $eventsContainer = this.$container.querySelector('.events-container');
    let activeItemClass = this.$container.querySelector('.is-active').classList;

    $eventsContainer.innerHTML = this.generateEventsMarkup();

    if ( this.checkEvents( this.selectedDate ).length ) {
      !activeItemClass.contains('has-event') && activeItemClass.add('has-event');
    } else {
      activeItemClass.contains('has-event') && activeItemClass.remove('has-event');
    }
  }

  prevMonth() {
    let currentYear = this.currentMonth.getFullYear(),
    currentMonth = this.currentMonth.getMonth();

    this.currentMonth = new Date(currentYear, currentMonth - 1, 1);
    this.renderApp();
  }

  nextMonth() {
    let currentYear = this.currentMonth.getFullYear(),
    currentMonth = this.currentMonth.getMonth();

    this.currentMonth = new Date(currentYear, currentMonth + 1, 1);
    this.renderApp();
  }

  selectDay(event) {
    let $target = event.target;

    if ($target.matches('.calendar-item')) {
      let isPrevMonth = $target.matches('.calendar-item-prev-month'),
      isNextMonth = $target.matches('.calendar-item-next-month');

      this.selectedDate = new Date($target.dataset.date);

      if (isPrevMonth || isNextMonth) {
        if (isPrevMonth) {
          this.prevMonth();
        } else {
          this.nextMonth();
        }
        $target = this.$container.querySelector(`[data-date="${this.selectedDate.toLocaleDateString()}"]`);
      } else {
        let $activeItem = this.$container.querySelector('.is-active');
        if ($activeItem) {
          $activeItem.classList.remove('is-active');
          this.activeDateClass && $activeItem.classList.remove(this.activeDateClass);
        }
      }

      $target.classList.add('is-active');
      this.activeDateClass && $target.classList.add(this.activeDateClass);
      this.renderEvents();
    }
  }

  generateMarkup() {
    this.$container.classList.add('calendar');

    this.$container.innerHTML = `
      <div class="calendar-wrapper">
        <div class="calendar-header">
          <button class="calendar-btn calendar-btn-prev">‹</button>
          <div class="calendar-header-date">
            ${this.getFormattedDate(this.currentMonth)}
          </div>
          <button class="calendar-btn calendar-btn-next">›</button>
        </div>
        <div class="calendar-body">
          <ul class="calendar-days-names">
            ${this.daysNames.map((day, index) => {
              return `<li class="calendar-day">${day.slice(0, 3)}</li>`
            }).join('')}
          </ul>
          <ul class="calendar-days-list">
            ${this.generateDaysMarkup()}
          </ul>
        </div>
      </div>
      <div class="calendar-events">
        <div class="calendar-events-inner">
          <div class="calendar-events-list">
            <div class="events-container">
              ${this.generateEventsMarkup()}
            </div>
            <div class="calendar-add-event-wrapper">
              <input class="calendar-input" type="text" placeholder="New Appointment" required/>
              <button class="calendar-add-event"></button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  checkEvents( date ) {
    let events = [];

    let currentEventDate = `${date.getFullYear()} / ${date.getMonth() + 1} / ${date.getDate()}`;

    for (let i = 0; i < this.events['events'].length; i++) {
      let event = this.events['events'][i];
      let eventDate = `${event['year']} / ${event['month']} / ${event['day']}`;
      Date.parse(eventDate) === Date.parse(currentEventDate) && events.push(event);
    }

    return events;
  }

  addEvent() {
    let $input = this.$container.querySelector('.calendar-input');

    if ( !$input.value.length ) return;

    let lastCreatedId = this.checkEvents( this.selectedDate );

    this.events['events'].push({
      'id': this.idGenerator,
      'title': $input.value,
      'year': this.selectedDate.getFullYear(),
      'month': this.selectedDate.getMonth() + 1,
      'day': this.selectedDate.getDate()
    });

    $input.value = '';

    this.renderEvents();
  }

  removeEvent() {
    if ( event.target.matches('.remove-event') ) {
      let eventId = event.target.parentNode.dataset.id;
      let eventIndex = this.events['events'].findIndex( event => event.id == eventId );

      this.events['events'].splice( eventIndex, 1 );

      this.renderEvents();
    }
  }

  initHandlers() {
    // prev month handler
    this.$container.querySelector('.calendar-btn-prev')
    .addEventListener('click', this.prevMonth.bind(this));

    // next month handler
    this.$container.querySelector('.calendar-btn-next')
    .addEventListener('click', this.nextMonth.bind(this));

    // delegated elements handler
    this.$container.querySelector('.calendar-days-list')
    .addEventListener('click', this.selectDay.bind(this));

    // add event handler
    this.$container.querySelector('.calendar-add-event')
    .addEventListener('click', this.addEvent.bind(this));

    // remove event handler
    this.$container.querySelector('.events-container')
    .addEventListener('click', this.removeEvent.bind(this));
  }

}

// App initialization
document.addEventListener('DOMContentLoaded', () => {
  const calendar = new Calendar({
    container: '.calendar'
  });
});