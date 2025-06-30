package main

import (
	"note-go/router"
)

func main() {
	r := router.SetupRouter()
	r.Run("0.0.0.0:3003")
}
