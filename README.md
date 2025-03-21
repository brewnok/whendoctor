## Teacher Details Object

```json
{
      "teacher_details": {
            "teacher1": {
                  "personalDetails": {
                        "name": "Teacher1",
                        "phone": "1234567890",
                        "address": "Teacher1_Address",
                        "qualification": "Teacher1_Qualification"
                  },
                  "tuition_filter_details": {
                        "classes": [
                              "IX",
                              "X"
                        ],
                        "subject_details": {
                              "stream": "stream1",
                              "subjects": [
                                    "s1_sub1",
                                    "s1_sub2",
                                    "s1_sub3"
                              ]
                        },
                        "image_path" : "/path/to/image.png",
                        "city" : "city1",
                        "google_map" : {
                              "qlink" : "https://www.google.com/maps?q=22.6014858,88.4271611"
                        }
                  }
            }
      }
}

```


## Input Parameter Objects
```json
{
      "city" : [
            "city1",
            "city2",
            "city3"
      ],

      "class" : [
            "IX",
            "X",
            "XI",
            "XII"
      ],
      "stream" : {
            "stream1" : ["s1_sub1", "s1_sub2", "s1_sub3"],
            "stream2" : ["s2_sub1", "s2_sub2", "s2_sub3"],
            "stream3" : ["s3_sub1", "s3_sub2", "s3_sub3"]
      }
}
```
