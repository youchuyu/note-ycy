package router

import (
	"net/http"
	"note-go/utils"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Static("/public", "./public")

	r.GET("/files", func(c *gin.Context) {
		files, err := utils.BuildFileTree("public/note")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"files": files})
	})

	r.LoadHTMLFiles("./public/index.html")

	r.NoRoute(func(c *gin.Context) {
		c.HTML(200, "index.html", nil)
	})
	r.GET("/", func(c *gin.Context) {
		c.File("./public/index.html")
	})

	return r
}
