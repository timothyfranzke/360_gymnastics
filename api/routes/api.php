<?php
/**
 * API Routes Configuration
 * Defines all REST endpoints and their corresponding controllers
 */

// Set CORS headers for all API requests
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize authentication middleware
$authMiddleware = new AuthMiddleware($db);

// Apply authentication middleware (this will check token for protected routes)
if (!$authMiddleware->handle()) {
    exit(); // Middleware will handle the response
}

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove API prefix from URI
$apiPrefixes = ['/360gym/api/v1', '/360gym/api', '/api/v1', '/api'];
foreach ($apiPrefixes as $prefix) {
    if (strpos($uri, $prefix) === 0) {
        $uri = substr($uri, strlen($prefix));
        break;
    }
}

// Simple router implementation
try {
    switch ($method) {
        case 'GET':
            handleGetRoutes($uri, $db);
            break;
        case 'POST':
            handlePostRoutes($uri, $db);
            break;
        case 'PUT':
            handlePutRoutes($uri, $db);
            break;
        case 'PATCH':
            handlePatchRoutes($uri, $db);
            break;
        case 'DELETE':
            handleDeleteRoutes($uri, $db);
            break;
        default:
            ResponseHelper::methodNotAllowed();
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    ResponseHelper::serverError('An unexpected error occurred');
}

/**
 * Handle GET routes
 */
function handleGetRoutes($uri, $db) {
    // Authentication routes
    if ($uri === '/auth/profile') {
        $controller = new AuthController($db);
        $controller->profile();
        return;
    }
    
    if ($uri === '/auth/verify') {
        $controller = new AuthController($db);
        $controller->verify();
        return;
    }

    // Migration route
    if ($uri === '/migrate') {
        handleMigration($db);
        return;
    }

    // Announcements routes
    if ($uri === '/announcements') {
        $controller = new AnnouncementController($db);
        $controller->index();
        return;
    }
    
    if ($uri === '/announcements/active') {
        $controller = new AnnouncementController($db);
        $controller->active();
        return;
    }
    
    if ($uri === '/announcements/stats') {
        $controller = new AnnouncementController($db);
        $controller->stats();
        return;
    }
    
    if (preg_match('/^\/announcements\/type\/(.+)$/', $uri, $matches)) {
        $controller = new AnnouncementController($db);
        $controller->byType($matches[1]);
        return;
    }
    
    if (preg_match('/^\/announcements\/(\d+)$/', $uri, $matches)) {
        $controller = new AnnouncementController($db);
        $controller->show($matches[1]);
        return;
    }

    // Staff routes
    if ($uri === '/staff') {
        $controller = new StaffController($db);
        $controller->index();
        return;
    }
    
    if ($uri === '/staff/homepage') {
        $controller = new StaffController($db);
        $controller->homepage();
        return;
    }
    
    if ($uri === '/staff/stats') {
        $controller = new StaffController($db);
        $controller->stats();
        return;
    }
    
    if (preg_match('/^\/staff\/(\d+)$/', $uri, $matches)) {
        $controller = new StaffController($db);
        $controller->show($matches[1]);
        return;
    }
    
    if (preg_match('/^\/staff\/(\d+)\/photo$/', $uri, $matches)) {
        $controller = new StaffController($db);
        $controller->getPhotoInfo($matches[1]);
        return;
    }
    
    // File serving endpoints
    if (preg_match('/^\/files\/staff\/(.+)$/', $uri, $matches)) {
        FileUploadUtility::serveFile($matches[1], 'main');
        return;
    }
    
    if (preg_match('/^\/files\/staff\/thumbnails\/(.+)$/', $uri, $matches)) {
        FileUploadUtility::serveFile($matches[1], 'thumbnail');
        return;
    }
    
    if (preg_match('/^\/files\/gallery\/(.+)$/', $uri, $matches)) {
        FileUploadUtility::serveGalleryFile($matches[1], 'main');
        return;
    }
    
    if (preg_match('/^\/files\/gallery\/thumbnails\/(.+)$/', $uri, $matches)) {
        FileUploadUtility::serveGalleryFile($matches[1], 'thumbnail');
        return;
    }

    // Gallery routes
    if ($uri === '/gallery') {
        $controller = new GalleryController($db);
        $controller->index();
        return;
    }
    
    if ($uri === '/gallery/featured') {
        $controller = new GalleryController($db);
        $controller->featured();
        return;
    }
    
    if ($uri === '/gallery/stats') {
        $controller = new GalleryController($db);
        $controller->stats();
        return;
    }
    
    if (preg_match('/^\/gallery\/(\d+)$/', $uri, $matches)) {
        $controller = new GalleryController($db);
        $controller->show($matches[1]);
        return;
    }

    // Gym Hours routes
    if ($uri === '/gym-hours') {
        $controller = new GymHoursController($db);
        $controller->index();
        return;
    }
    
    if ($uri === '/gym-hours/week') {
        $controller = new GymHoursController($db);
        $controller->week();
        return;
    }
    
    if ($uri === '/gym-hours/status') {
        $controller = new GymHoursController($db);
        $controller->status();
        return;
    }
    
    if ($uri === '/gym-hours/stats') {
        $controller = new GymHoursController($db);
        $controller->stats();
        return;
    }
    
    if ($uri === '/gym-hours/check') {
        $controller = new GymHoursController($db);
        $controller->checkTime();
        return;
    }
    
    if ($uri === '/gym-hours/next-opening') {
        $controller = new GymHoursController($db);
        $controller->nextOpening();
        return;
    }
    
    if (preg_match('/^\/gym-hours\/([a-z]+)$/', $uri, $matches)) {
        $controller = new GymHoursController($db);
        $controller->show($matches[1]);
        return;
    }

    // Gym Closures routes
    if ($uri === '/gym-closures') {
        $controller = new GymClosureController($db);
        $controller->index();
        return;
    }
    
    if ($uri === '/gym-closures/upcoming') {
        $controller = new GymClosureController($db);
        $controller->upcoming();
        return;
    }
    
    if ($uri === '/gym-closures/current-month') {
        $controller = new GymClosureController($db);
        $controller->currentMonth();
        return;
    }
    
    if ($uri === '/gym-closures/check') {
        $controller = new GymClosureController($db);
        $controller->checkClosure();
        return;
    }
    
    if ($uri === '/gym-closures/stats') {
        $controller = new GymClosureController($db);
        $controller->stats();
        return;
    }
    
    if (preg_match('/^\/gym-closures\/(\d+)$/', $uri, $matches)) {
        $controller = new GymClosureController($db);
        $controller->show($matches[1]);
        return;
    }

    // Jackrabbit routes
    if ($uri === '/classes/schedule') {
        $controller = new JackrabbitController($db);
        $controller->schedule();
        return;
    }

    // Calendar routes
    if ($uri === '/calendar') {
        $controller = new CalendarController($db);
        $controller->index();
        return;
    }

    if ($uri === '/calendar/camps-clinics') {
        $controller = new CalendarController($db);
        $controller->campsAndClinics();
        return;
    }

    // Gymnastics Classes routes
    if ($uri === '/classes') {
        $controller = new GymnasticsClassController($db);
        $controller->index();
        return;
    }
    
    if ($uri === '/classes/featured') {
        $controller = new GymnasticsClassController($db);
        $controller->featured();
        return;
    }
    
    if ($uri === '/classes/search') {
        $controller = new GymnasticsClassController($db);
        $controller->search();
        return;
    }
    
    if (preg_match('/^\/classes\/([a-z0-9-]+)$/', $uri, $matches)) {
        $controller = new GymnasticsClassController($db);
        $controller->show($matches[1]);
        return;
    }

    // Class Page Settings routes
    if ($uri === '/class-page-settings') {
        $controller = new ClassPageSettingsController($db);
        $controller->index();
        return;
    }

    if ($uri === '/class-page-settings/public') {
        $controller = new ClassPageSettingsController($db);
        $controller->publicSettings();
        return;
    }

    // Banner routes
    if ($uri === '/banner') {
        $controller = new HeroBannerController($db);
        $controller->index();
        return;
    }
    
    if ($uri === '/banner/public') {
        $controller = new HeroBannerController($db);
        $controller->publicBanner();
        return;
    }
    
    if ($uri === '/banner/stats') {
        $controller = new HeroBannerController($db);
        $controller->stats();
        return;
    }

    // Camps routes
    if ($uri === '/camps') {
        $controller = new CampsController($db);
        $controller->index();
        return;
    }
    
    if ($uri === '/camps/active') {
        $controller = new CampsController($db);
        $controller->active();
        return;
    }
    
    if ($uri === '/camps/upcoming') {
        $controller = new CampsController($db);
        $controller->upcoming();
        return;
    }
    
    if ($uri === '/camps/stats') {
        $controller = new CampsController($db);
        $controller->stats();
        return;
    }
    
    if (preg_match('/^\/camps\/(\d+)$/', $uri, $matches)) {
        $controller = new CampsController($db);
        $controller->show($matches[1]);
        return;
    }

    // Events routes
    if ($uri === '/events') {
        $controller = new EventsController($db);
        $controller->index();
        return;
    }
    
    if ($uri === '/events/active') {
        $controller = new EventsController($db);
        $controller->active();
        return;
    }
    
    if ($uri === '/events/upcoming') {
        $controller = new EventsController($db);
        $controller->upcoming();
        return;
    }
    
    if ($uri === '/events/stats') {
        $controller = new EventsController($db);
        $controller->stats();
        return;
    }
    
    if (preg_match('/^\/events\/(\d+)$/', $uri, $matches)) {
        $controller = new EventsController($db);
        $controller->show($matches[1]);
        return;
    }

    // Party routes
    if ($uri === '/parties') {
        $controller = new PartyController($db);
        $controller->index();
        return;
    }
    
    if ($uri === '/parties/stats') {
        $controller = new PartyController($db);
        $controller->stats();
        return;
    }
    
    if ($uri === '/parties/new-count') {
        $controller = new PartyController($db);
        $controller->getNewCount();
        return;
    }
    
    if (preg_match('/^\/parties\/(\d+)$/', $uri, $matches)) {
        $controller = new PartyController($db);
        $controller->show($matches[1]);
        return;
    }

    // Open Gym routes
    if ($uri === '/open-gym') {
        $controller = new OpenGymController($db);
        $controller->getAll();
        return;
    }
    
    if ($uri === '/open-gym/main') {
        $controller = new OpenGymController($db);
        $controller->getMainConfig();
        return;
    }
    
    if ($uri === '/open-gym/structured') {
        $controller = new OpenGymController($db);
        $controller->getStructuredConfig();
        return;
    }
    
    if ($uri === '/open-gym/age-groups') {
        $controller = new OpenGymController($db);
        $controller->getAgeGroups();
        return;
    }
    
    if (preg_match('/^\/open-gym\/age-groups\/(\d+)$/', $uri, $matches)) {
        $controller = new OpenGymController($db);
        $controller->getAgeGroup($matches[1]);
        return;
    }

    // Contact routes
    if ($uri === '/contacts') {
        $controller = new ContactController($db);
        $controller->getContacts();
        return;
    }
    
    if ($uri === '/contacts/new-count') {
        $controller = new ContactController($db);
        $controller->getNewCount();
        return;
    }
    
    if (preg_match('/^\/contacts\/(\d+)$/', $uri, $matches)) {
        $controller = new ContactController($db);
        $controller->getContact($matches[1]);
        return;
    }

    // User management routes
    if ($uri === '/users') {
        $controller = new UserController($db);
        $controller->index();
        return;
    }

    if ($uri === '/users/stats') {
        $controller = new UserController($db);
        $controller->stats();
        return;
    }

    if (preg_match('/^\/users\/(\d+)$/', $uri, $matches)) {
        $controller = new UserController($db);
        $controller->show($matches[1]);
        return;
    }

    // FAQ routes (public)
    if ($uri === '/faqs') {
        $controller = new FaqController($db);
        $controller->index();
        return;
    }

    if ($uri === '/faqs/search') {
        $controller = new FaqController($db);
        $controller->search();
        return;
    }

    if ($uri === '/faqs/all') {
        $controller = new FaqController($db);
        $controller->all();
        return;
    }

    if ($uri === '/faqs/stats') {
        $controller = new FaqController($db);
        $controller->stats();
        return;
    }

    if (preg_match('/^\/faqs\/category\/([a-z0-9-]+)$/', $uri, $matches)) {
        $controller = new FaqController($db);
        $controller->byCategory($matches[1]);
        return;
    }

    if (preg_match('/^\/faqs\/(\d+)$/', $uri, $matches)) {
        $controller = new FaqController($db);
        $controller->show($matches[1]);
        return;
    }

    // FAQ Category routes
    if ($uri === '/faq-categories') {
        $controller = new FaqController($db);
        $controller->categories();
        return;
    }

    if ($uri === '/faq-categories/all') {
        $controller = new FaqController($db);
        $controller->allCategories();
        return;
    }

    if (preg_match('/^\/faq-categories\/(\d+)$/', $uri, $matches)) {
        $controller = new FaqController($db);
        $controller->showCategory($matches[1]);
        return;
    }

    // Screen Images routes
    if ($uri === '/screen-images') {
        $controller = new ScreenImagesController($db);
        $controller->index();
        return;
    }

    if ($uri === '/screen-images/positions') {
        $controller = new ScreenImagesController($db);
        $controller->positions();
        return;
    }

    if (preg_match('/^\/screen-images\/gallery\/(\d+)$/', $uri, $matches)) {
        $controller = new ScreenImagesController($db);
        $controller->byGallery($matches[1]);
        return;
    }

    if (preg_match('/^\/screen-images\/(\d+)$/', $uri, $matches)) {
        $controller = new ScreenImagesController($db);
        $controller->show($matches[1]);
        return;
    }

    // Pages routes
    if ($uri === '/pages/published') {
        $controller = new PageController($db);
        $controller->published();
        return;
    }

    if ($uri === '/pages/stats') {
        $controller = new PageController($db);
        $controller->stats();
        return;
    }

    if ($uri === '/pages') {
        $controller = new PageController($db);
        $controller->index();
        return;
    }

    if (preg_match('/^\/pages\/slug\/([a-z0-9-]+)$/', $uri, $matches)) {
        $controller = new PageController($db);
        $controller->showBySlug($matches[1]);
        return;
    }

    if (preg_match('/^\/pages\/(\d+)$/', $uri, $matches)) {
        $controller = new PageController($db);
        $controller->show($matches[1]);
        return;
    }

    // File serving for page images
    if (preg_match('/^\/files\/pages\/thumbnails\/(.+)$/', $uri, $matches)) {
        FileUploadUtility::servePageFile($matches[1], 'thumbnail');
        return;
    }

    if (preg_match('/^\/files\/pages\/(.+)$/', $uri, $matches)) {
        FileUploadUtility::servePageFile($matches[1], 'main');
        return;
    }

    // If no route matches
    ResponseHelper::notFound('Route not found');
}

/**
 * Handle POST routes
 */
function handlePostRoutes($uri, $db) {
    // Authentication routes
    if ($uri === '/auth/login') {
        $controller = new AuthController($db);
        $controller->login();
        return;
    }
    
    if ($uri === '/auth/register') {
        $controller = new AuthController($db);
        $controller->register();
        return;
    }
    
    if ($uri === '/auth/logout') {
        $controller = new AuthController($db);
        $controller->logout();
        return;
    }
    
    if ($uri === '/auth/refresh') {
        $controller = new AuthController($db);
        $controller->refresh();
        return;
    }

    // Announcements routes
    if ($uri === '/announcements') {
        $controller = new AnnouncementController($db);
        $controller->create();
        return;
    }

    // Staff routes
    if ($uri === '/staff') {
        $controller = new StaffController($db);
        $controller->create();
        return;
    }
    
    if ($uri === '/staff/upload-photo') {
        $controller = new StaffController($db);
        $controller->uploadPhoto();
        return;
    }
    
    if ($uri === '/staff/upload-photo-anonymous') {
        $controller = new StaffController($db);
        $controller->uploadPhotoAnonymous();
        return;
    }

    // Gym Hours routes
    if ($uri === '/gym-hours/reset') {
        $controller = new GymHoursController($db);
        $controller->reset();
        return;
    }

    // Gym Closures routes
    if ($uri === '/gym-closures') {
        $controller = new GymClosureController($db);
        $controller->create();
        return;
    }
    
    if ($uri === '/gym-closures/close-today') {
        $controller = new GymClosureController($db);
        $controller->closeToday();
        return;
    }
    
    if ($uri === '/gym-closures/emergency') {
        $controller = new GymClosureController($db);
        $controller->emergency();
        return;
    }

    // Gymnastics Classes routes
    if ($uri === '/classes') {
        $controller = new GymnasticsClassController($db);
        $controller->create();
        return;
    }

    // Banner routes
    if ($uri === '/banner/reset') {
        $controller = new HeroBannerController($db);
        $controller->reset();
        return;
    }

    // Camps routes
    if ($uri === '/camps') {
        $controller = new CampsController($db);
        $controller->create();
        return;
    }

    // Events routes
    if ($uri === '/events') {
        $controller = new EventsController($db);
        $controller->create();
        return;
    }

    // Gallery routes
    if ($uri === '/gallery') {
        $controller = new GalleryController($db);
        $controller->create();
        return;
    }
    
    if ($uri === '/gallery/upload') {
        $controller = new GalleryController($db);
        $controller->upload();
        return;
    }
    
    if ($uri === '/gallery/reorder') {
        $controller = new GalleryController($db);
        $controller->reorder();
        return;
    }
    
    if ($uri === '/gallery/cleanup') {
        $controller = new GalleryController($db);
        $controller->cleanup();
        return;
    }

    // Open Gym routes
    if ($uri === '/open-gym/age-groups') {
        $controller = new OpenGymController($db);
        $controller->createAgeGroup();
        return;
    }

    // Contact routes
    if ($uri === '/contact') {
        $controller = new ContactController($db);
        $controller->submit();
        return;
    }

    // Party routes
    if ($uri === '/parties') {
        $controller = new PartyController($db);
        $controller->submit();
        return;
    }

    // User management routes
    if ($uri === '/users') {
        $controller = new UserController($db);
        $controller->create();
        return;
    }
    
    if (preg_match('/^\/users\/(\d+)\/reset-password$/', $uri, $matches)) {
        $controller = new UserController($db);
        $controller->resetPassword($matches[1]);
        return;
    }

    // FAQ routes
    if ($uri === '/faqs') {
        $controller = new FaqController($db);
        $controller->create();
        return;
    }

    if ($uri === '/faqs/reorder') {
        $controller = new FaqController($db);
        $controller->reorder();
        return;
    }

    // FAQ Category routes
    if ($uri === '/faq-categories') {
        $controller = new FaqController($db);
        $controller->createCategory();
        return;
    }

    if ($uri === '/faq-categories/reorder') {
        $controller = new FaqController($db);
        $controller->reorderCategories();
        return;
    }

    // Screen Images routes
    if ($uri === '/screen-images') {
        $controller = new ScreenImagesController($db);
        $controller->assign();
        return;
    }

    // Pages routes
    if ($uri === '/pages') {
        $controller = new PageController($db);
        $controller->create();
        return;
    }

    if ($uri === '/pages/upload-image') {
        $controller = new PageController($db);
        $controller->uploadImage();
        return;
    }

    ResponseHelper::notFound('Route not found');
}

/**
 * Handle PUT routes
 */
function handlePutRoutes($uri, $db) {
    // Authentication routes
    if ($uri === '/auth/profile') {
        $controller = new AuthController($db);
        $controller->updateProfile();
        return;
    }
    
    if ($uri === '/auth/password') {
        $controller = new AuthController($db);
        $controller->changePassword();
        return;
    }

    // Announcements routes
    if (preg_match('/^\/announcements\/(\d+)$/', $uri, $matches)) {
        $controller = new AnnouncementController($db);
        $controller->update($matches[1]);
        return;
    }

    // Staff routes
    if (preg_match('/^\/staff\/(\d+)$/', $uri, $matches)) {
        $controller = new StaffController($db);
        $controller->update($matches[1]);
        return;
    }

    // Gym Hours routes
    if (preg_match('/^\/gym-hours\/([a-z]+)$/', $uri, $matches)) {
        $controller = new GymHoursController($db);
        $controller->update($matches[1]);
        return;
    }
    
    if ($uri === '/gym-hours/bulk') {
        $controller = new GymHoursController($db);
        $controller->bulkUpdate();
        return;
    }

    // Gym Closures routes
    if (preg_match('/^\/gym-closures\/(\d+)$/', $uri, $matches)) {
        $controller = new GymClosureController($db);
        $controller->update($matches[1]);
        return;
    }

    // Class Page Settings routes
    if ($uri === '/class-page-settings') {
        $controller = new ClassPageSettingsController($db);
        $controller->update();
        return;
    }

    // Banner routes
    if ($uri === '/banner') {
        $controller = new HeroBannerController($db);
        $controller->update();
        return;
    }

    // Camps routes
    if (preg_match('/^\/camps\/(\d+)$/', $uri, $matches)) {
        $controller = new CampsController($db);
        $controller->update($matches[1]);
        return;
    }

    // Events routes
    if (preg_match('/^\/events\/(\d+)$/', $uri, $matches)) {
        $controller = new EventsController($db);
        $controller->update($matches[1]);
        return;
    }

    // Gymnastics Classes routes
    if (preg_match('/^\/classes\/([a-z0-9-]+)$/', $uri, $matches)) {
        $controller = new GymnasticsClassController($db);
        $controller->update($matches[1]);
        return;
    }

    // Gallery routes
    if (preg_match('/^\/gallery\/(\d+)$/', $uri, $matches)) {
        $controller = new GalleryController($db);
        $controller->update($matches[1]);
        return;
    }

    // Party routes
    if (preg_match('/^\/parties\/(\d+)\/status$/', $uri, $matches)) {
        $controller = new PartyController($db);
        $controller->updateStatus($matches[1]);
        return;
    }

    // Contact routes
    if (preg_match('/^\/contacts\/(\d+)$/', $uri, $matches)) {
        $controller = new ContactController($db);
        $controller->updateContact($matches[1]);
        return;
    }

    // Open Gym routes
    if ($uri === '/open-gym/main') {
        $controller = new OpenGymController($db);
        $controller->updateMainConfig();
        return;
    }
    
    if ($uri === '/open-gym/structured') {
        $controller = new OpenGymController($db);
        $controller->updateStructuredConfig();
        return;
    }
    
    if (preg_match('/^\/open-gym\/age-groups\/(\d+)$/', $uri, $matches)) {
        $controller = new OpenGymController($db);
        $controller->updateAgeGroup($matches[1]);
        return;
    }

    // User management routes
    if (preg_match('/^\/users\/(\d+)$/', $uri, $matches)) {
        $controller = new UserController($db);
        $controller->update($matches[1]);
        return;
    }

    // FAQ routes
    if (preg_match('/^\/faqs\/(\d+)$/', $uri, $matches)) {
        $controller = new FaqController($db);
        $controller->update($matches[1]);
        return;
    }

    // FAQ Category routes
    if (preg_match('/^\/faq-categories\/(\d+)$/', $uri, $matches)) {
        $controller = new FaqController($db);
        $controller->updateCategory($matches[1]);
        return;
    }

    // Pages routes
    if (preg_match('/^\/pages\/(\d+)$/', $uri, $matches)) {
        $controller = new PageController($db);
        $controller->update($matches[1]);
        return;
    }

    ResponseHelper::notFound('Route not found');
}

/**
 * Handle PATCH routes
 */
function handlePatchRoutes($uri, $db) {
    // Announcements routes
    if (preg_match('/^\/announcements\/(\d+)\/toggle$/', $uri, $matches)) {
        $controller = new AnnouncementController($db);
        $controller->toggle($matches[1]);
        return;
    }

    // Banner routes
    if ($uri === '/banner/toggle') {
        $controller = new HeroBannerController($db);
        $controller->toggle();
        return;
    }

    // Camps routes
    if (preg_match('/^\/camps\/(\d+)\/toggle$/', $uri, $matches)) {
        $controller = new CampsController($db);
        $controller->toggle($matches[1]);
        return;
    }

    // Events routes
    if (preg_match('/^\/events\/(\d+)\/toggle$/', $uri, $matches)) {
        $controller = new EventsController($db);
        $controller->toggle($matches[1]);
        return;
    }

    // FAQ routes
    if (preg_match('/^\/faqs\/(\d+)\/toggle$/', $uri, $matches)) {
        $controller = new FaqController($db);
        $controller->toggle($matches[1]);
        return;
    }

    // FAQ Category routes
    if (preg_match('/^\/faq-categories\/(\d+)\/toggle$/', $uri, $matches)) {
        $controller = new FaqController($db);
        $controller->toggleCategory($matches[1]);
        return;
    }

    // Pages routes
    if (preg_match('/^\/pages\/(\d+)\/toggle$/', $uri, $matches)) {
        $controller = new PageController($db);
        $controller->toggle($matches[1]);
        return;
    }

    ResponseHelper::notFound('Route not found');
}

/**
 * Handle DELETE routes
 */
function handleDeleteRoutes($uri, $db) {
    // Announcements routes
    if (preg_match('/^\/announcements\/(\d+)$/', $uri, $matches)) {
        $controller = new AnnouncementController($db);
        $controller->delete($matches[1]);
        return;
    }

    // Staff routes
    if (preg_match('/^\/staff\/(\d+)$/', $uri, $matches)) {
        $controller = new StaffController($db);
        $controller->delete($matches[1]);
        return;
    }
    
    if (preg_match('/^\/staff\/(\d+)\/photo$/', $uri, $matches)) {
        $controller = new StaffController($db);
        $controller->deletePhoto($matches[1]);
        return;
    }

    // Gym Closures routes
    if (preg_match('/^\/gym-closures\/(\d+)$/', $uri, $matches)) {
        $controller = new GymClosureController($db);
        $controller->delete($matches[1]);
        return;
    }

    // Camps routes
    if (preg_match('/^\/camps\/(\d+)$/', $uri, $matches)) {
        $controller = new CampsController($db);
        $controller->delete($matches[1]);
        return;
    }

    // Events routes
    if (preg_match('/^\/events\/(\d+)$/', $uri, $matches)) {
        $controller = new EventsController($db);
        $controller->delete($matches[1]);
        return;
    }

    // Gymnastics Classes routes
    if (preg_match('/^\/classes\/([a-z0-9-]+)$/', $uri, $matches)) {
        $controller = new GymnasticsClassController($db);
        $controller->delete($matches[1]);
        return;
    }

    // Gallery routes
    if (preg_match('/^\/gallery\/(\d+)$/', $uri, $matches)) {
        $controller = new GalleryController($db);
        $controller->delete($matches[1]);
        return;
    }

    // Party routes
    if (preg_match('/^\/parties\/(\d+)$/', $uri, $matches)) {
        $controller = new PartyController($db);
        $controller->delete($matches[1]);
        return;
    }

    // Contact routes
    if (preg_match('/^\/contacts\/(\d+)$/', $uri, $matches)) {
        $controller = new ContactController($db);
        $controller->deleteContact($matches[1]);
        return;
    }

    // Open Gym routes
    if (preg_match('/^\/open-gym\/age-groups\/(\d+)$/', $uri, $matches)) {
        $controller = new OpenGymController($db);
        $controller->deleteAgeGroup($matches[1]);
        return;
    }

    // User management routes
    if (preg_match('/^\/users\/(\d+)$/', $uri, $matches)) {
        $controller = new UserController($db);
        $controller->delete($matches[1]);
        return;
    }

    // FAQ routes
    if (preg_match('/^\/faqs\/(\d+)$/', $uri, $matches)) {
        $controller = new FaqController($db);
        $controller->delete($matches[1]);
        return;
    }

    // FAQ Category routes
    if (preg_match('/^\/faq-categories\/(\d+)$/', $uri, $matches)) {
        $controller = new FaqController($db);
        $controller->deleteCategory($matches[1]);
        return;
    }

    // Screen Images routes
    if (preg_match('/^\/screen-images\/(\d+)$/', $uri, $matches)) {
        $controller = new ScreenImagesController($db);
        $controller->remove($matches[1]);
        return;
    }

    // Pages routes
    if (preg_match('/^\/pages\/(\d+)$/', $uri, $matches)) {
        $controller = new PageController($db);
        $controller->delete($matches[1]);
        return;
    }

    ResponseHelper::notFound('Route not found');
}

/**
 * Handle database migration
 */
function handleMigration($db) {
    try {
        $migration = new Migration();
        
        $action = $_GET['action'] ?? 'run';
        
        if ($action === 'status') {
            $status = $migration->getStatus();
            ResponseHelper::success($status, 'Migration status retrieved');
            return;
        }
        
        if ($action === 'run') {
            $result = $migration->runMigrations();
            ResponseHelper::success($result, 'Migration completed');
            return;
        }
        
        ResponseHelper::error('Invalid migration action', 400);
        
    } catch (Exception $e) {
        ResponseHelper::serverError('Migration failed: ' . $e->getMessage());
    }
}