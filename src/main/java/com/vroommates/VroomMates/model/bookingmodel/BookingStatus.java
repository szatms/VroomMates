package com.vroommates.VroomMates.model.bookingmodel;

public enum BookingStatus {
    JOINED,     // aktív utas, jelenleg utazik / csatlakozott
    LEFT,       // útközben kiszállt (ha támogatott)
    CANCELLED   // csatlakozott, de még indulás előtt lemondta
}