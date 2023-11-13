"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.soundworksMax = void 0;

var _server = require("@soundworks/core/server");

class ServerMaxExperience extends _server.AbstractExperience {
  constructor(...args) {
    super(...args);

    this.require('sync');
  }

}

const soundworksMax = {
  experience: null,

  init(server, options = {}) {
    // add max client to config
    server.addListener('inited', () => {
      if (!server.config.app.clients) {
        server.config.app.clients = {};
      }

      server.config.app.clients.max = {
        target: 'node'
      };
      this.experience = new ServerMaxExperience(server, 'max');
    });
    server.addListener('started', async () => {
      await this.experience.start();
    });
  }

};
exports.soundworksMax = soundworksMax;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTZXJ2ZXJNYXhFeHBlcmllbmNlIiwiQWJzdHJhY3RFeHBlcmllbmNlIiwiY29uc3RydWN0b3IiLCJhcmdzIiwicmVxdWlyZSIsInNvdW5kd29ya3NNYXgiLCJleHBlcmllbmNlIiwiaW5pdCIsInNlcnZlciIsIm9wdGlvbnMiLCJhZGRMaXN0ZW5lciIsImNvbmZpZyIsImFwcCIsImNsaWVudHMiLCJtYXgiLCJ0YXJnZXQiLCJzdGFydCJdLCJzb3VyY2VzIjpbIi4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBYnN0cmFjdEV4cGVyaWVuY2UgfSBmcm9tICdAc291bmR3b3Jrcy9jb3JlL3NlcnZlcic7XG5cbmNsYXNzIFNlcnZlck1heEV4cGVyaWVuY2UgZXh0ZW5kcyBBYnN0cmFjdEV4cGVyaWVuY2Uge1xuICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncyk7XG5cbiAgICB0aGlzLnJlcXVpcmUoJ3N5bmMnKTtcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgc291bmR3b3Jrc01heCA9IHtcbiAgZXhwZXJpZW5jZTogbnVsbCxcblxuICBpbml0KHNlcnZlciwgb3B0aW9ucyA9IHt9KSB7XG4gICAgLy8gYWRkIG1heCBjbGllbnQgdG8gY29uZmlnXG4gICAgc2VydmVyLmFkZExpc3RlbmVyKCdpbml0ZWQnLCAoKSA9PiB7XG4gICAgICBpZiAoIXNlcnZlci5jb25maWcuYXBwLmNsaWVudHMpIHtcbiAgICAgICAgc2VydmVyLmNvbmZpZy5hcHAuY2xpZW50cyA9IHt9O1xuICAgICAgfVxuXG4gICAgICBzZXJ2ZXIuY29uZmlnLmFwcC5jbGllbnRzLm1heCA9IHsgdGFyZ2V0OiAnbm9kZScgfTtcblxuICAgICAgdGhpcy5leHBlcmllbmNlID0gbmV3IFNlcnZlck1heEV4cGVyaWVuY2Uoc2VydmVyLCAnbWF4Jyk7XG4gICAgfSk7XG5cbiAgICBzZXJ2ZXIuYWRkTGlzdGVuZXIoJ3N0YXJ0ZWQnLCBhc3luYyAoKSA9PiB7XG4gICAgICBhd2FpdCB0aGlzLmV4cGVyaWVuY2Uuc3RhcnQoKTtcbiAgICB9KTtcbiAgfVxufVxuXG4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFFQSxNQUFNQSxtQkFBTixTQUFrQ0MsMEJBQWxDLENBQXFEO0VBQ25EQyxXQUFXLENBQUMsR0FBR0MsSUFBSixFQUFVO0lBQ25CLE1BQU0sR0FBR0EsSUFBVDs7SUFFQSxLQUFLQyxPQUFMLENBQWEsTUFBYjtFQUNEOztBQUxrRDs7QUFROUMsTUFBTUMsYUFBYSxHQUFHO0VBQzNCQyxVQUFVLEVBQUUsSUFEZTs7RUFHM0JDLElBQUksQ0FBQ0MsTUFBRCxFQUFTQyxPQUFPLEdBQUcsRUFBbkIsRUFBdUI7SUFDekI7SUFDQUQsTUFBTSxDQUFDRSxXQUFQLENBQW1CLFFBQW5CLEVBQTZCLE1BQU07TUFDakMsSUFBSSxDQUFDRixNQUFNLENBQUNHLE1BQVAsQ0FBY0MsR0FBZCxDQUFrQkMsT0FBdkIsRUFBZ0M7UUFDOUJMLE1BQU0sQ0FBQ0csTUFBUCxDQUFjQyxHQUFkLENBQWtCQyxPQUFsQixHQUE0QixFQUE1QjtNQUNEOztNQUVETCxNQUFNLENBQUNHLE1BQVAsQ0FBY0MsR0FBZCxDQUFrQkMsT0FBbEIsQ0FBMEJDLEdBQTFCLEdBQWdDO1FBQUVDLE1BQU0sRUFBRTtNQUFWLENBQWhDO01BRUEsS0FBS1QsVUFBTCxHQUFrQixJQUFJTixtQkFBSixDQUF3QlEsTUFBeEIsRUFBZ0MsS0FBaEMsQ0FBbEI7SUFDRCxDQVJEO0lBVUFBLE1BQU0sQ0FBQ0UsV0FBUCxDQUFtQixTQUFuQixFQUE4QixZQUFZO01BQ3hDLE1BQU0sS0FBS0osVUFBTCxDQUFnQlUsS0FBaEIsRUFBTjtJQUNELENBRkQ7RUFHRDs7QUFsQjBCLENBQXRCIn0=