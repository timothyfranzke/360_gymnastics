// src/app/services/jackrabbit.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class JackrabbitService {
  constructor(private http: HttpClient) {}

  getJackrabbitSchedule(cat1: string): Observable<any> {
    const scriptUrl =
      '/jackrabbit/Openings.asp?id=514082&Cat1=' + cat1 + '&sortcols=Day&hidecols=Class%20Ends,Class%20Starts,Class%20Starts,Description,Session';
    return this.http.get(scriptUrl, { responseType: 'text' }).pipe(
      map((scriptContent) => {
        const tableRowRegex = /<tr class="openings"[^>]*>(.*?)<\/tr>/gs;
        const rows = [];
        let match;

        while ((match = tableRowRegex.exec(scriptContent)) !== null) {
          rows.push(match[1]);
        }

        // Helper function to extract text content from HTML, removing tags
        function extractTextContent(html: string) {
          return html
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }

        // Helper function to extract href from anchor tag
        function extractHref(html: string) {
          const hrefMatch = html.match(/href="([^"]+)"/);
          return hrefMatch ? hrefMatch[1] : null;
        }

        function extractButtonInfo(html: string) {
          // Extract the URL (href attribute)
          const hrefMatch = html.match(/href="([^"]+)"/);
          const url = hrefMatch ? hrefMatch[1] : null;
          
          // Extract the button text (content between opening and closing a tags)
          const textMatch = html.match(/<a[^>]*>(.*?)<\/a>/);
          const buttonText = textMatch ? textMatch[1].trim() : null;
          
          return {
            text: buttonText,
            href: url
          };
        }

        // Parse each row into structured data
        const tableData: any[] = [];

        rows.forEach((row, index) => {
          if (index === 0) {
            // Skip header row
            return;
          }

          // Extract all td elements from the row
          const tdRegex = /<td[^>]*>(.*?)<\/td>/gs;
          const cells = [];
          let cellMatch;

          while ((cellMatch = tdRegex.exec(row)) !== null) {
            cells.push(cellMatch[1]);
          }

          if (cells.length >= 10) {
            // Extract the registration URL from the register link
            const registerUrl = extractHref(cells[2]);

            const rowData = {
              id: extractTextContent(cells[0]), // Hidden ID
              className: extractTextContent(cells[3]), // Class name
              day: extractTextContent(cells[4]), // Day
              time: extractTextContent(cells[5]), // Time
              gender: extractTextContent(cells[6]), // Gender
              ages: extractTextContent(cells[7]), // Age range
              openings: parseInt(extractTextContent(cells[8])) || 0, // Number of openings
              tuition: parseFloat(extractTextContent(cells[9])) || 0, // Tuition cost
              registrationButton: extractButtonInfo(cells[2])
            };

            tableData.push(rowData);
          }
        });
        tableData.sort((a, b) => {
          const dayOrder: {[key: string]: number} = {
            'Sun': 0,
            'Mon': 1,
            'Tue': 2,
            'Wed': 3,
            'Thu': 4,
            'Fri': 5,
            'Sat': 6
          };
          const dayA = a.day && dayOrder.hasOwnProperty(a.day) ? dayOrder[a.day] : 999;
          const dayB = b.day && dayOrder.hasOwnProperty(b.day) ? dayOrder[b.day] : 999;
          
          if (dayA !== dayB) {
            return dayA - dayB;
          }
          
          // If same day, sort by time
          return parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time);
        });
        
        // Helper function to parse time string to minutes for comparison
        function parseTimeToMinutes(timeStr: string): number {
          if (!timeStr) return 0;
          
          // Extract hours, minutes, and AM/PM
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (!match) return 0;
          
          let hours = parseInt(match[1], 10);
          const minutes = parseInt(match[2], 10);
          const isPM = match[3].toUpperCase() === 'PM';
          
          // Convert to 24-hour format for easier comparison
          if (isPM && hours < 12) hours += 12;
          if (!isPM && hours === 12) hours = 0;
          
          return hours * 60 + minutes;
        }
        return tableData;
      })
    );
  }
}
