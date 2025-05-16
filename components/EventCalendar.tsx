'use client';

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { eventsData } from '@/lib/data';

interface Event {
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  url?: string;
  extendedProps?: {
    description?: string;
    price?: string;
    location?: string;
  };
}

export default function EventCalendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [calendarReady, setCalendarReady] = useState(false);

  useEffect(() => {
    // Format the events data for FullCalendar
    const formattedEvents: Event[] = eventsData.map((event) => {
      // Parse date and time strings to create proper Date objects
      const dateStr = event.date;
      const timeStr = event.time;
      let startDate: Date | null = null;
      let endDate: Date | null = null;
      
      // Handle regular events
      if (!dateStr.includes('each month')) {
        const [monthStr, dayStr, yearStr] = dateStr.split(', ')[0].split(' ');
        const month = getMonthNumber(monthStr);
        const day = parseInt(dayStr);
        const year = parseInt(yearStr);
        
        if (timeStr.includes('-')) {
          // Has start and end time
          const [startTime, endTime] = timeStr.split(' - ');
          startDate = createDateWithTime(year, month, day, startTime);
          endDate = createDateWithTime(year, month, day, endTime);
        } else {
          // All day event
          startDate = new Date(year, month, day);
        }
      } else {
        // For recurring events like "Last Friday of each month"
        // Just use the next occurrence for demo
        const currentDate = new Date();
        const nextMonth = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const lastFriday = getLastDayOfMonth(year, nextMonth, 5); // 5 = Friday
        
        if (timeStr.includes('-')) {
          const [startTime, endTime] = timeStr.split(' - ');
          startDate = createDateWithTime(year, nextMonth, lastFriday, startTime);
          endDate = createDateWithTime(year, nextMonth, lastFriday, endTime);
        } else {
          startDate = new Date(year, nextMonth, lastFriday);
        }
      }
      
      // Create event object
      return {
        title: event.title,
        start: startDate ? startDate.toISOString() : '',
        end: endDate ? endDate.toISOString() : undefined,
        allDay: !timeStr.includes('-'),
        backgroundColor: getEventColor(event.title),
        borderColor: getEventColor(event.title),
        extendedProps: {
          description: event.description,
          price: event.price,
          location: event.location
        }
      };
    });
    
    setEvents(formattedEvents);
    setCalendarReady(true);
  }, []);
  
  // Helper functions
  function getMonthNumber(monthName: string): number {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months.findIndex(m => monthName.includes(m));
  }
  
  function createDateWithTime(year: number, month: number, day: number, timeStr: string): Date {
    const isPM = timeStr.includes('PM');
    let [hours, minutes] = timeStr.replace(/ AM| PM/, '').split(':').map(num => parseInt(num));
    
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    
    return new Date(year, month, day, hours, minutes);
  }
  
  function getLastDayOfMonth(year: number, month: number, dayOfWeek: number): number {
    const lastDay = new Date(year, month + 1, 0).getDate();
    const date = new Date(year, month, lastDay);
    
    // Go backwards until we find the desired day of week
    while (date.getDay() !== dayOfWeek) {
      date.setDate(date.getDate() - 1);
    }
    
    return date.getDate();
  }
  
  function getEventColor(title: string): string {
    // Assign different colors to different event types
    if (title.includes('Skills Clinic')) return '#4caf50';
    if (title.includes('Showcase')) return '#2196f3';
    if (title.includes('Camp')) return '#ff9800';
    if (title.includes('Parents')) return '#9c27b0';
    if (title.includes('Meet')) return '#f44336';
    return '#0066cc'; // default color (primary)
  }
  
  return (
    <div className="event-calendar-container bg-white rounded-lg shadow-md p-4 w-full">
      {calendarReady ? (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
          }}
          events={events}
          height="auto"
          eventDisplay="block"
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short'
          }}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            const event = info.event;
            const props = event.extendedProps as { description?: string; price?: string; location?: string };
            
            alert(`
              ${event.title}
              ${event.start ? new Date(event.start).toLocaleString() : ''}
              ${props.location ? `Location: ${props.location}` : ''}
              ${props.price ? `Price: ${props.price}` : ''}
              ${props.description ? `\n${props.description}` : ''}
            `);
          }}
        />
      ) : (
        <div className="h-64 flex items-center justify-center">
          <p>Loading calendar...</p>
        </div>
      )}
    </div>
  );
}
