package com.slambook.digital_slambook.exception;

public class ResourceNotFoundException extends RuntimeException{

    public ResourceNotFoundException(String message) {

        super(message);
    }
}
