package utils

import (
	"note-go/models"
	"os"
	"path/filepath"
)

func BuildFileTree(root string) (*models.FileNode, error) {
	info, err := os.Stat(root)

	if err != nil {
		return nil, err
	}

	node := &models.FileNode{
		Name:  info.Name(),
		Path:  root,
		IsDir: info.IsDir(),
	}

	if info.IsDir() {
		entries, err := os.ReadDir(root)
		if err != nil {
			return nil, err
		}
		for _, entry := range entries {
			childPath := filepath.Join(root, entry.Name())
			childNode, err := BuildFileTree(childPath)
			if err != nil {
				return nil, err
			}
			node.Children = append(node.Children, childNode)
		}
	}

	return node, nil
}
