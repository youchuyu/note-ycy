package router

import (
	"net/http"
	"note-go/utils"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.LoadHTMLGlob("templates/*")

	r.Static("/public", "./public")

	r.GET("/files", func(c *gin.Context) {
		files, err := utils.BuildFileTree("public/note")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"files": files})
	})

	return r
}
