package service

import "errors"

var (
	ErrNotFound = errors.New("resource not found")
	ErrValidation = errors.New("validation error")
) 