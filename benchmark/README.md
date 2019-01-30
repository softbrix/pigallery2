# PiGallery2 performance benchmark results

These results are created mostly for development, but I'm making them public for curious users.

## PiGallery2 v1.5.8, 26.01.2019

**System**: Intel(R) Core(TM) i7-6700HQ CPU @ 2.60GHz, 16GB Ram, SHDD: 1TB, 5400 rpm
**Gallery**: directories: 0 media: 341, faces: 39
| action | action details | average time | details |
|:------:|:--------------:|:------------:|:-------:|
| Scanning directory |  | 2486.5ms | media: 341, directories:0 |
| Saving directory |  | 780.0ms | - |
| Listing Directory |  | 31.5ms | media: 341, directories:0 |
| searching | `a` as `directory` | 2.9ms | - |
| searching | `a` as `person` | 7.3ms | media: 39, directories:0 |
| searching | `a` as `keyword` | 30.8ms | media: 339, directories:0 |
| searching | `a` as `position` | 25.7ms | media: 282, directories:0 |
| searching | `a` as `photo` | 2.8ms | - |
| searching | `a` as `video` | 2.6ms | - |
| searching | `a` as `any` | 33.0ms | media: 339, directories:0 |
| instant search | `a` | 6.1ms | media: 10, directories:0 |
| auto complete | `a` | 5.4ms | items: 10 | 
