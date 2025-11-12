
/**
 * Оптимизированная загрузка файлов
 */
export const fileUploadUtils = {
  /**
   * Проверяет размер файла и предупреждает о больших файлах
   */
  checkFileSize(file, maxSizeMB = 50) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      console.warn(`Файл ${file.name} имеет большой размер (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      return false
    }
    return true
  },

  /**
   * Создает оптимизированный FormData для загрузки
   */
  createOptimizedFormData(data, file) {
    const formData = new FormData()

    // Добавляем файл первым
    if (file) {
      formData.set('file', file)
    }

    // Добавляем остальные данные
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => {
            const itemValue = typeof item === 'object' ? item.pk || item.id : item
            formData.append(key, itemValue.toString())
          })
        } else if (typeof value === 'object') {
          formData.set(key, value.pk || value.id || value)
        } else {
          formData.set(key, value)
        }
      }
    })

    return formData
  },

  /**
   * Создает конфигурацию для axios с оптимизированными настройками
   */
  createUploadConfig(url, formData, onProgress) {
    return {
      method: 'POST',
      url,
      data: formData,
      onUploadProgress: onProgress,
      timeout: 300000, // 5 минут таймаут
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  }
}

/**
 * Утилиты для работы с файлами
 */
export const fileUtils = {
  /**
   * Получает расширение файла
   */
  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
  },

  /**
   * Форматирует размер файла
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  /**
   * Проверяет, является ли файл изображением
   */
  isImage(file) {
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    return imageTypes.includes(file.type)
  },

  /**
   * Проверяет, является ли файл документом
   */
  isDocument(file) {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    return documentTypes.includes(file.type)
  }
}

