package repository

type ExampleRepository struct {}

func NewExampleRepository() *ExampleRepository {
	return &ExampleRepository{}
}

func (r *ExampleRepository) GetExample() string {
	return "Hello from repository!"
} 