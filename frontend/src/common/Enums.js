const ENUMS = {
    "platforms": {
      "Yelp": 0,
      "Twitter": 1,
      "News": 2,
      "reverse": [
        "Yelp",
        "Twitter",
        "News"
      ]
    },
    "search_statuses": {
      "NEW": 0,
      "QUEUED": 1,
      "IN_PROGRESS": 2,
      "COMPLETED": 3,
      "NOTFOUND": 4,
      "reverse": [
        "NEW",
        "QUEUED",
        "IN_PROGRESS",
        "COMPLETED",
        "NOTFOUND"
      ]
    },
    "monitor_statuses": {
      "NEW": 0,
      "SCHEDULED": 1,
      "MONITORING": 2,
      "COMPLETED": 3,
      "NOTFOUND": 4,
      "reverse": [
        "NEW",
        "SCHEDULED",
        "MONITORING",
        "COMPLETED",
        "NOTFOUND"
      ]
    }
  }

export const platforms = ENUMS.platforms
export const search_statuses = ENUMS.search_statuses
export const monitor_statuses = ENUMS.monitor_statuses