### v 1.0.4 (21st Mar 2021)
- Fixing core-js missing deps

### v 1.0.3 (9th Mar 2021)
- Fixing legacy browser support

### v 1.0.1 (2nd Dec 2020)
- Deps update

### v 1.0.0 (08 Jul 2020)
- Cleaner defaults (https://github.com/yury-dymov/json-api-normalizer/pull/63)
- Given that this library is stable and used by many others, I think it's a good time to make a stable 1.0.0 :)

### v 0.4.16 (05 Aug 2019)
- Updated vulnerable deps

### v 0.4.15 (17 Jun 2019)
- Updated vulnerable deps

### v. 0.4.14 (16 Nov 2018)
- updated deps

### v. 0.4.12 (08 Oct 2018)
- camelizeKeys sometimes was not applied to `meta` as expected (https://github.com/yury-dymov/json-api-normalizer/issues/48)

### v. 0.4.11 (28 June 2018)
- camelizeKeys is now affecting `links` as well (https://github.com/yury-dymov/json-api-normalizer/pull/41)

### v. 0.4.10 (14 Feb 2018)
- new option added `camelizeTypeValues` to control camelization of propogated type (https://github.com/yury-dymov/json-api-normalizer/issues/34)

### v. 0.4.9 (14 Feb 2018)
- type is propogated to object (https://github.com/yury-dymov/json-api-normalizer/issues/32)

### v. 0.4.8 (01 Feb 2018)
- metadata and links are saved if `data` is null per spec (https://github.com/yury-dymov/json-api-normalizer/pull/31)

### v. 0.4.7 (21 Dec 2017)
- camelizeKeys is now affecting `meta` as well (https://github.com/yury-dymov/json-api-normalizer/pull/29)

### v. 0.4.6 (29 Nov 2017)
- Meta property is also available for relationship objects (https://github.com/yury-dymov/json-api-normalizer/issues/25)
- cross-env support added

### v. 0.4.5 (23 Oct 2017)
While processing nested objects, we should handle dates accordingly (https://github.com/yury-dymov/json-api-normalizer/issues/23)

### v. 0.4.4 (23 Oct 2017)
While processing nested objects, we shouldn't change array attributes to object (https://github.com/yury-dymov/json-api-normalizer/issues/22)

### v. 0.4.3 (20 Oct 2017)
Nested attribute keys are also camelized now (https://github.com/yury-dymov/json-api-normalizer/issues/21)

### v. 0.4.2 (25 Sep 2017)
Added meta support per spec (https://github.com/yury-dymov/json-api-normalizer/issues/19)

### v. 0.4.1 (11 Jun 2017)
Including self links in normalization (https://github.com/yury-dymov/json-api-normalizer/pull/16)

### v. 0.4.0 (15 Mar 2017)
Relationshop normalization implementation changed [discussion](https://github.com/yury-dymov/json-api-normalizer/issues/11)

### v. 0.3.0 (09 Mar 2017)
IDs now preserved in entities. [discussion](https://github.com/yury-dymov/json-api-normalizer/issues/3)

### v. 0.2.4 (08 Mar 2017)
Store links for subqueries in meta [#7](https://github.com/yury-dymov/json-api-normalizer/issues/6)

### v. 0.2.3 (06 Mar 2017)
Fixed issue, when data is null for the meta [#5](https://github.com/yury-dymov/json-api-normalizer/pull/5)

### v. 0.2.1 (28 Feb 2017)
Fixed issue, when data is null [#4](https://github.com/yury-dymov/json-api-normalizer/issues/4)

### v. 0.2.0 (09 Feb 2017)
Format changed for `filterEndpoint` option equals `false` for metadata.

#### Was

```js
{
  "meta": {
    "/test?page=1": {...},
    "/test?page=2": {...},
    "/anotherTest": {...}
  }
}
```

#### Now

```json
{
  "meta": {
    "/test": {
      "?page=1": {...},
      "?page=2": {...}
    },
    "/anotherTest": {...}
  }
}
```

### v. 0.1.1 (03 Feb 2017)
Added lazy loading support according to [#2](https://github.com/yury-dymov/json-api-normalizer/issues/2)
