import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Class } from '../interface/class';
import {
  ApiResponse,
  PaginatedResponse,
  CreateClassRequest,
  UpdateClassRequest,
  ClassFilters,
  ApiEndpoints
} from '../interfaces/api';

@Injectable({
  providedIn: 'root'
})
export class ClassesService {
  private readonly API_BASE = environment.api.baseUrl;

  constructor(private http: HttpClient) {}
  classes: Class[] = [
    {
      id: "parent-tot",
      name: "PARENT TOT",
      ageRange: "Ages 18mo-3yrs",
      description: "This is a parent participation class. In this class, we will work on fine and gross motor skills, hand-eye, foot-eye coordination, listening skills, body awareness and cooperative play. This class is very active for both parent and child.",
      skills: [
        "kicking, throwing, hitting a ball",
        "hopping with feet together, feet apart, variation of jumps",
        "balancing on a low beam, high beam, angled beam, wiggly beam",
        "swinging on bars and rings",
        "jumping on trampolines",
        "front rolls down the wedges"
      ],
      structure: [],
      prerequisites: [],
      ratio: "10:1",
      duration: "50 MIN CLASS",
      url: "/classes/parent-tot"
    },
    {
      id: "threes",
      name: "THREES",
      ageRange: "Age 3-3.99yrs",
      description: "This class is a step up from parent-tot class without participation from parents. Parents are asked to stay in the lobby during class.",
      skills: ["Floor: Forward rolls down an incline & on the floor, cartwheel progressions, handstand progressions, barrel rolls", "Bars: Swinging, pullover w/ assistance, skin the cat, around the world", "Vault: Running, jumping with feet together, landing properly", "Beam: Low beam (walking forward, backward, sideways, hopping) High beam (walking forward with assistance)", "Strength and conditioning skills are also taught."],
      structure: ["15 minute warm up (stretch, game)", "15 minutes 1st event", "15 minutes 2nd event", "5 minutes warm down (conditioning, game)", "Strength and conditioning skills are also taught."],
      ratio: "6:1",
      prerequisites: [],
      duration: "50 MIN CLASS",
      url: "/classes/threes"
    },
    {
      id: "beginner-preschool",
      name: "BEGINNER PRESCHOOL",
      ageRange: "4-5.99yrs",
      description: "This class is a starter class for kids who have never experienced gymnastics before. We will work on the basics of gymnastics while incorporating fun and games.",
      skills: ["Floor: Forward rolls on the floor, backward rolls down the wedge & on the floor, handstand progressions, cartwheel progressions, variations of jumps", "Bars: Swinging, pullover wwith assistance, skin the cat, around the world", "Vault: Running, jumping with feet together, landing properly", "Beam: Low beam (hops, tip toe walking, leaps) High beam (Walking forwards, sideways, Backwards by themselves)", "Strength and conditioning skills are also taught."],
      structure: [ "15 minute warm up (stretch, game)", "15 minutes 1st event", "15 minutes 2nd event", "5 minutes warm down (conditioning, game)", "Strength and conditioning skills are also taught."],
      ratio: "6:1",
      prerequisites: [],
      duration: "50 MIN CLASS",
      url: "/classes/beginner-preschool"
    },
    {
      id: "advanced-preschool",
      name: "ADVANCED PRESCHOOL",
      ageRange: "4-5.99yrs",
      description: "This is class is geared for the children that have had gymnastics experience before. In this class we will work on more advanced gymnastics skills while still making it fun for everyone.",
      skills: [
        "Floor: Backbend, kickover, handstand hold, round-off",
        "Bars: Back hip circle, glides, tap swings, cast horizontal",
        "Vault: Low Beam (cartwheels, handstands, jumps), High Beam (pirouettes, turns, leaps)",
        "Beam: Arm swing and hurdle, handstands, handstand flat back"
      ],
      structure: [
        "15 minute warm up (stretch, game)",
        "15 minutes 1st event",
        "15 minutes 2nd event",
        "5 minutes warm down (conditioning, game)"
      ],
      prerequisites: ["Backward roll on the floor, cartwheel, handstand, squat on vault, pullover by themselves, walk on beam (forward, backwards, hop) by themselves"],
      ratio: "6:1",
      duration: "50 MIN CLASS",
      url: "/classes/advanced-preschool"
    },
    {
      id: "level-1",
      name: "LEVEL 1",
      ageRange: "6yrs and Older",
      description: "This class is for children that have no gymnastics experience. We will work on basic gymnastics skills along with body awareness and physical conditioning.",
      skills: [
        "Floor: Forward and backward rolls, cartwheels, handstands, bridges",
        "Bars: Pullover with assistance, cast, swings, glides",
        "Beam: Walking forwards, sideways, backwards, hops, leaps",
        "Vault: Arm circle, running and jumping, variation of jumps"
      ],
      structure: [
        "10 minute warm up/stretch",
        "15 minutes 1st event",
        "15 minutes 2nd event",
        "10 minute cool down/conditioning"
      ],
      prerequisites: [],
      ratio: "8:1",
      duration: "50 MIN CLASS",
      url: "/classes/level-1"
    },
    {
      id: "level-2",
      name: "LEVEL 2",
      ageRange: "6yrs and Older",
      description: "This class is a step up from Level 1 so we will work on a little more advanced gymnastics skills while still mastering the basic skills. We will work on back handsprings, round offs, back hip circles, kip drills, handstands on vault, etc. See requirements below.",
      skills: [
        "Floor: Backbend, kickover, handstand hold, round-off",
        "Bars: Back hip circle, glides, tap swings, cast horizontal",
        "Beam: Low Beam (cartwheels, handstands, jumps), High Beam (pirouettes, turns, leaps)",
        "Vault: Arm swing and hurdle, handstands, handstand flat back"
      ],
      structure: [
        "10 minute warm up/stretch",
        "15 minutes 1st event",
        "15 minutes 2nd event",
        "10 minute cool down/conditioning"
      ],
      prerequisites: [
        "Backward roll on the floor",
        "Cartwheel",
        "Handstand",
        "Squat on vault",
        "Pullover on bar by themselves",
        "Walk on beam (forward, backwards, hop) by themselves"
      ],
      ratio: "8:1",
      duration: "50 MIN CLASS",
      url: "/classes/level-2"
    },
    {
      id: "level-3",
      name: "LEVEL 3",
      ageRange: "6yrs and Older",
      description: "This class is for children who have gymnastics experience and are capable of doing more advanced gymnastics. We will work on core strength, tumbling, bigger swings, and more body awareness.",
      skills: [
        "Floor: Back handsprings, front handsprings, round-off, back handspring progressions",
        "Bars: Front hip circle, jump straddle glide, cast horizontal",
        "Vault: Handstand flat back, front flip, front handspring",
        "Beam: Dismounts, cartwheels, turns, handstands"
      ],
      structure: [
        "10 minute warm up/stretch",
        "15 minutes 1st event",
        "15 minutes 2nd event",
        "10 minute cool down/conditioning"  
      ],
      prerequisites: [
        "Backbend kickover",
        "Roundoff",
        "Front limber",
        "Cast back hip circle",
        "Glide",
        "Tap swing",
        "Handstand flat back on vault",
        "Cartwheel on low beam",
        "Jumps on beam"
      ],
      ratio: "8:1",
      duration: "50 MIN CLASS",
      url: "/classes/level-3"
    },
    {
      id: "level-4",
      name: "LEVEL 4",
      ageRange: "6yrs and Older",
      description: "This class is for children who have gymnastics experience and are capable of doing more advanced gymnastics. We will work on core strength, advanced tumbling, bigger swings, and more body awareness.",
      skills: [
        "Floor: Roundoff Back handsprings, front flips, back tucks",
        "Bars: Kips, fly-aways, baby giants",
        "Vault: Front handspring on vault table",
        "Beam: Back walkovers, roundoffs dismounts, full turns & leaps"
      ],
      structure: [
        "10 minute warm up/stretch",
        "15 minutes 1st event",
        "15 minutes 2nd event",
        "10 minute cool down/conditioning"
      ],
      prerequisites: [
        "Backbend kickover",
        "Back handspring",
        "Front handspring",
        "Cast back hip circle",
        "Glide",
        "Tap swing",
        "Handstand flat back on vault",
        "Cartwheel & handstand on high beam",
        "Jumps on beam"
      ],
      ratio: "10:1",
      duration: "90 MIN CLASS",
      url: "/classes/level-4"
    },
    {
      id: "beginner-boys",
      name: "BOYS BEGINNER",
      ageRange: "6yrs and Older",
      description: "This boys only class is geared for boys that have never had any gymnastics experience. We will learn the basics on all six of the boys’ event apparatus, core strength, and body control.",
      skills: [
        "Floor: Forward and backward roll, handstands, cartwheels, bridges",
        "Pommel horse- swings, support travels, circles on mushroom",
        "Rings- swings, inverted hang, skin the cat",
        "Vault- running and jumping, arm swing, jumps",
        "Parallel bars- under swing, support swings, L-seats",
        "High bar- tap swings, pirouettes, pullovers, cast"
      ],
      structure: [
        "10 minute warm up/stretch",
        "15 minutes 1st event",
        "15 minutes 2nd event",
        "10 minute cool down/conditioning"        
      ],
      prerequisites: [
      ],
      ratio: "8:1",
      duration: "50 MIN CLASS",
      url: "/classes/beginner-boys"
    },
    {
      id: "advanced-boys",
      name: "BOYS ADVANCED",
      ageRange: "6yrs and Older",
      description: "This class is a step up from the boys beginner class. We will continue to work on some basic skills, strength, and body awareness. We will also work on more difficult skills on all six of the boy events while keeping it fun.",
      skills: [
        "Floor: back bends, kickovers, roundoff, handstand",
        "Pommel horse: leg cuts, circles on mushroom",
        "Rings: Lseats, bigger swings, flyaways",
        "Vault: front flips, front handsprings, various jumps",
        "Parallel bars: upper arm swings, dismounts",
        "High bar: cast back hip circle, bigger tap swings, cast shoot out"
      ],
      structure: [
        "10 minute warm up/stretch",
        "15 minutes 1st event",
        "15 minutes 2nd event",
        "10 minute cool down/conditioning"      
      ],
      prerequisites: [
      ],
      ratio: "8:1",
      duration: "50 MIN CLASS",
      url: "/classes/advanced-boys"
    },
    {
      id: "tumbling",
      name: "TUMBLING CLASSES",
      ageRange: "6-12 years",
      description: "In this class we work on basic tumbling to advanced tumbling. There is no previous tumbling experience needed for this class. In addition to tumbling we will work on jumps, strength, and conditioning.",
      skills: [
        "Handstands, round offs, walkovers, aerials, front handsprings, back handsprings, standing back flips",
        "Tumbling passes: round off back handsprings, back flips, layouts, full twist"
      ],
      structure: [
        "10 minute warm up/stretch",
        "5 minutes basic tumbling",
        "35 minutes open tumbling",
        "10 minute cool down/conditioning"   
      ],
      prerequisites: [
      ],
      ratio: "",
      duration: "60 MIN CLASS",
      url: "/classes/tumbling"
    },
    {
      id: "tumbling-13",
      name: "TUMBLING CLASSES 13 to 18",
      ageRange: "6-12 years",
      description: "In this class we work on basic tumbling to advanced tumbling. There is no previous tumbling experience needed for this class. In addition to tumbling we will work on jumps, strength, and conditioning.",
      skills: [
        "Handstands, round offs, walkovers, aerials, front handsprings, back handsprings, standing back flips",
        "Tumbling passes: round off back handsprings, back flips, layouts, full twist"
      ],
      structure: [
        "10 minute warm up/stretch",
        "5 minutes basic tumbling",
        "35 minutes open tumbling  ",
        "10 minute cool down/conditioning"   
      ],
      prerequisites: [
        "Tumbling: NA",
        "Intermediate Tumbling: This class is designed for kids who are ready to start working on harder skills and honing their basic skills. We will work round offs, back bends, front limbers, back handsprings and front handsprings. Children must be able to do a cartwheel, handstand and bridge for this class.",
        "Advanced: We will start making our basic tumbling skills stronger. We will work on round off back handsprings, multiple back handsprings, front handsprings, and front flips. For this class children must be able to do round offs, back handsprings and kickovers."
      ],
      ratio: "",
      duration: "60 MIN CLASS",
      url: "/classes/tumbling"
    },
    {
      id: "adult-gymnastics",
      name: "ADULT CLASS",
      ageRange: "18+ years",
      structure: [],
      prerequisites: [],
      description: "In these classes, we work on basic tumbling to advanced tumbling. There is no previous tumbling experience needed for this class. Besides tumbling we will work on jumps, strength, and conditioning.",
      skills: [],
      ratio: "",
      duration: "90 MIN CLASS - $10 drop in",
      url: "/classes/adult-gymnastics"
    },
    {
      id: "homeschool-classes",
      name: "HOMESCHOOL CLASSES",
      ageRange: "6yrs and Older",
      description: "This class is for children with no gymnastics experience. We will work on basic gymnastics skills along with body awareness and physical conditioning.",
      skills: [
        "Floor: Forward and backward rolls, cartwheels, handstands, bridges",
        "Bars: Pullover with assistance, cast, swings, glides",
        "Beam: Walking forwards, sideways, backwards, hops, leaps",
        "Vault: Arm circle, running and jumping, variation of jumps"
      ],
      structure: [
        "10 minute warm up/stretch",
        "15 minutes 1st event",
        "15 minutes 2nd event",
        "10 minute cool down/conditioning"
      ],
      prerequisites: [
        
      ],
      ratio: "",
      duration: "90 MIN CLASS - $10 drop in",
      url: "/classes/adult-gymnastics"
    }
  ];

  // ========== PUBLIC METHODS (using local data) ==========

  getLocalClasses(): Class[] {
    return this.classes;
  }

  getLocalClass(id: string): Class {
    return this.classes.find(c => c.id === id) || {} as Class;
  }

  // ========== API METHODS (CRUD operations) ==========

  /**
   * Get all classes with optional filters
   */
  getClasses(filters?: ClassFilters): Observable<PaginatedResponse<Class>> {
    let params = new HttpParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ApiResponse<PaginatedResponse<Class>>>(
      `${this.API_BASE}${ApiEndpoints.CLASSES}`,
      { params }
    ).pipe(
      map(response => this.handlePaginatedResponse<Class>(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Get class by ID
   */
  getClass(id: string): Observable<Class> {
    return this.http.get<ApiResponse<Class>>(
      `${this.API_BASE}${ApiEndpoints.CLASSES}/${id}`
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Create new class
   */
  createClass(classData: CreateClassRequest): Observable<Class> {
    return this.http.post<ApiResponse<Class>>(
      `${this.API_BASE}${ApiEndpoints.CLASSES}`,
      classData
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Update class
   */
  updateClass(id: string, classData: UpdateClassRequest): Observable<Class> {
    return this.http.put<ApiResponse<Class>>(
      `${this.API_BASE}${ApiEndpoints.CLASSES}/${id}`,
      classData
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Delete class
   */
  deleteClass(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(
      `${this.API_BASE}${ApiEndpoints.CLASSES}/${id}`
    ).pipe(
      map(() => void 0),
      catchError(this.handleError)
    );
  }

  /**
   * Get featured classes (public endpoint)
   */
  getFeaturedClasses(): Observable<Class[]> {
    const params = new HttpParams().set('featured', 'true');
    
    return this.http.get<ApiResponse<Class[]>>(
      `${this.API_BASE}${ApiEndpoints.CLASSES}/featured`,
      { params }
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Search classes by name or description
   */
  searchClasses(query: string, limit?: number): Observable<Class[]> {
    let params = new HttpParams().set('search', query);
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    
    return this.http.get<ApiResponse<Class[]>>(
      `${this.API_BASE}${ApiEndpoints.CLASSES}/search`,
      { params }
    ).pipe(
      map(response => this.handleResponse(response)),
      catchError(this.handleError)
    );
  }

  // ========== UTILITY METHODS ==========

  /**
   * Handle successful API responses
   */
  private handleResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    return response.data!;
  }

  /**
   * Handle successful paginated API responses
   */
  private handlePaginatedResponse<T>(response: any): PaginatedResponse<T> {
    if (!response.success) {
      throw new Error(response.message || 'API request failed');
    }
    
    return {
      data: response.data || [],
      pagination: {
        current_page: response.pagination?.current_page || 1,
        total_pages: response.pagination?.total_pages || 1,
        total_items: response.pagination?.total_items || 0,
        items_per_page: response.pagination?.per_page || response.pagination?.items_per_page || 10,
        has_next_page: response.pagination?.has_next_page || false,
        has_previous_page: response.pagination?.has_prev_page || response.pagination?.has_previous_page || false
      }
    };
  }

  /**
   * Handle API errors
   */
  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An unexpected error occurred';
    
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.error?.errors) {
      const errors = Object.values(error.error.errors).flat();
      errorMessage = (errors as string[]).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  };
}
