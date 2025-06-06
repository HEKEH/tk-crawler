// vite.config.mts
import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  CommonTerserOptions,
  getCommonPostcssConfig,
  getCommonVitePlugins
} from "file:///Users/hekai/Desktop/projects/tk/packages/build-and-deploy/dist/index.mjs";
import { getCommonPackageAlias } from "file:///Users/hekai/Desktop/projects/tk/packages/build-and-deploy/dist/package-alias.js";
import { defineConfig } from "file:///Users/hekai/Desktop/projects/tk/node_modules/.pnpm/vite@5.4.14_@types+node@22.13.10_sass@1.85.1/node_modules/vite/dist/node/index.js";
import electron from "file:///Users/hekai/Desktop/projects/tk/node_modules/.pnpm/vite-plugin-electron@0.29.0_vite-plugin-electron-renderer@0.14.6/node_modules/vite-plugin-electron/dist/simple.mjs";
import { createHtmlPlugin } from "file:///Users/hekai/Desktop/projects/tk/node_modules/.pnpm/vite-plugin-html@3.2.2_vite@5.4.14/node_modules/vite-plugin-html/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/hekai/Desktop/projects/tk/apps/main-client";
var __vite_injected_original_import_meta_url = "file:///Users/hekai/Desktop/projects/tk/apps/main-client/vite.config.mts";
var vite_config_default = defineConfig(({ mode }) => {
  const isProduction = mode === "production";
  const packageJSON = JSON.parse(
    readFileSync(new URL("./package.json", __vite_injected_original_import_meta_url), "utf8")
  );
  const external = [
    ...Object.keys(packageJSON.dependencies || {}),
    ...Object.keys(packageJSON.peerDependencies || {})
  ];
  const alias = getCommonPackageAlias(isProduction);
  const envConfig = {
    envDir: path.resolve(__vite_injected_original_dirname, "../.."),
    // 环境文件目录
    envPrefix: ["CLIENT_"]
    // 环境变量前缀
  };
  const electronOptions = {
    main: {
      // Shortcut of `build.lib.entry`.
      entry: "electron/main.ts",
      vite: {
        // assetsInclude: ['**/*.exe', '**/*.dll', '**/*.so', '**/*.node'],
        resolve: {
          alias
        },
        build: {
          minify: isProduction ? "terser" : false,
          rollupOptions: {
            external
          },
          terserOptions: CommonTerserOptions,
          sourcemap: false
        },
        ...envConfig
      }
    },
    preload: {
      // Shortcut of `build.rollupOptions.input`.
      // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
      input: path.join(__vite_injected_original_dirname, "electron/preload.ts")
    },
    // Ployfill the Electron and Node.js API for Renderer process.
    // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
    // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
    renderer: process.env.NODE_ENV === "test" ? (
      // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
      void 0
    ) : {}
  };
  const result = {
    plugins: [
      ...getCommonVitePlugins({ packageJSON }),
      createHtmlPlugin({
        pages: [
          {
            filename: "index.html",
            template: "index.html",
            injectOptions: {
              data: {
                title: packageJSON.description
              }
            }
          }
        ]
      }),
      electron(electronOptions)
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@tk-crawler/styles/mixins.scss" as *;
          `
        }
      },
      postcss: getCommonPostcssConfig()
    },
    build: {
      minify: isProduction ? "terser" : false,
      outDir: "dist",
      rollupOptions: {
        external,
        input: {
          main: path.resolve(__vite_injected_original_dirname, "index.html")
        }
      },
      terserOptions: CommonTerserOptions,
      target: "es2015",
      sourcemap: false
    },
    resolve: {
      alias
    },
    ...envConfig
  };
  return result;
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2hla2FpL0Rlc2t0b3AvcHJvamVjdHMvdGsvYXBwcy9tYWluLWNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2hla2FpL0Rlc2t0b3AvcHJvamVjdHMvdGsvYXBwcy9tYWluLWNsaWVudC92aXRlLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2hla2FpL0Rlc2t0b3AvcHJvamVjdHMvdGsvYXBwcy9tYWluLWNsaWVudC92aXRlLmNvbmZpZy5tdHNcIjtpbXBvcnQgdHlwZSB7IEFsaWFzT3B0aW9ucywgSW5saW5lQ29uZmlnLCBVc2VyQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdHlwZSB7IEVsZWN0cm9uU2ltcGxlT3B0aW9ucyB9IGZyb20gJ3ZpdGUtcGx1Z2luLWVsZWN0cm9uL3NpbXBsZSc7XG5pbXBvcnQgeyByZWFkRmlsZVN5bmMgfSBmcm9tICdub2RlOmZzJztcbmltcG9ydCBwYXRoIGZyb20gJ25vZGU6cGF0aCc7XG5pbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IHtcbiAgQ29tbW9uVGVyc2VyT3B0aW9ucyxcbiAgZ2V0Q29tbW9uUG9zdGNzc0NvbmZpZyxcbiAgZ2V0Q29tbW9uVml0ZVBsdWdpbnMsXG59IGZyb20gJ0B0ay1jcmF3bGVyL2J1aWxkLWFuZC1kZXBsb3kvaW5kZXgubWpzJztcbmltcG9ydCB7IGdldENvbW1vblBhY2thZ2VBbGlhcyB9IGZyb20gJ0B0ay1jcmF3bGVyL2J1aWxkLWFuZC1kZXBsb3kvcGFja2FnZS1hbGlhcy5qcyc7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCBlbGVjdHJvbiBmcm9tICd2aXRlLXBsdWdpbi1lbGVjdHJvbi9zaW1wbGUnO1xuaW1wb3J0IHsgY3JlYXRlSHRtbFBsdWdpbiB9IGZyb20gJ3ZpdGUtcGx1Z2luLWh0bWwnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBtb2RlID09PSAncHJvZHVjdGlvbic7XG4gIGNvbnN0IHBhY2thZ2VKU09OID0gSlNPTi5wYXJzZShcbiAgICByZWFkRmlsZVN5bmMobmV3IFVSTCgnLi9wYWNrYWdlLmpzb24nLCBpbXBvcnQubWV0YS51cmwpLCAndXRmOCcpLFxuICApO1xuICBjb25zdCBleHRlcm5hbCA9IFtcbiAgICAuLi5PYmplY3Qua2V5cyhwYWNrYWdlSlNPTi5kZXBlbmRlbmNpZXMgfHwge30pLFxuICAgIC4uLk9iamVjdC5rZXlzKHBhY2thZ2VKU09OLnBlZXJEZXBlbmRlbmNpZXMgfHwge30pLFxuICBdO1xuICBjb25zdCBhbGlhczogQWxpYXNPcHRpb25zID0gZ2V0Q29tbW9uUGFja2FnZUFsaWFzKGlzUHJvZHVjdGlvbik7XG4gIGNvbnN0IGVudkNvbmZpZyA9IHtcbiAgICBlbnZEaXI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLicpLCAvLyBcdTczQUZcdTU4ODNcdTY1ODdcdTRFRjZcdTc2RUVcdTVGNTVcbiAgICBlbnZQcmVmaXg6IFsnQ0xJRU5UXyddLCAvLyBcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0ZcdTUyNERcdTdGMDBcbiAgfTtcblxuICBjb25zdCBlbGVjdHJvbk9wdGlvbnM6IEVsZWN0cm9uU2ltcGxlT3B0aW9ucyA9IHtcbiAgICBtYWluOiB7XG4gICAgICAvLyBTaG9ydGN1dCBvZiBgYnVpbGQubGliLmVudHJ5YC5cbiAgICAgIGVudHJ5OiAnZWxlY3Ryb24vbWFpbi50cycsXG4gICAgICB2aXRlOiB7XG4gICAgICAgIC8vIGFzc2V0c0luY2x1ZGU6IFsnKiovKi5leGUnLCAnKiovKi5kbGwnLCAnKiovKi5zbycsICcqKi8qLm5vZGUnXSxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgIGFsaWFzLFxuICAgICAgICB9LFxuICAgICAgICBidWlsZDoge1xuICAgICAgICAgIG1pbmlmeTogaXNQcm9kdWN0aW9uID8gJ3RlcnNlcicgOiBmYWxzZSxcbiAgICAgICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgICAgICBleHRlcm5hbCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRlcnNlck9wdGlvbnM6IENvbW1vblRlcnNlck9wdGlvbnMsXG4gICAgICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICAgICAgfSxcbiAgICAgICAgLi4uZW52Q29uZmlnLFxuICAgICAgfSBhcyBJbmxpbmVDb25maWcsXG4gICAgfSxcbiAgICBwcmVsb2FkOiB7XG4gICAgICAvLyBTaG9ydGN1dCBvZiBgYnVpbGQucm9sbHVwT3B0aW9ucy5pbnB1dGAuXG4gICAgICAvLyBQcmVsb2FkIHNjcmlwdHMgbWF5IGNvbnRhaW4gV2ViIGFzc2V0cywgc28gdXNlIHRoZSBgYnVpbGQucm9sbHVwT3B0aW9ucy5pbnB1dGAgaW5zdGVhZCBgYnVpbGQubGliLmVudHJ5YC5cbiAgICAgIGlucHV0OiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnZWxlY3Ryb24vcHJlbG9hZC50cycpLFxuICAgIH0sXG4gICAgLy8gUGxveWZpbGwgdGhlIEVsZWN0cm9uIGFuZCBOb2RlLmpzIEFQSSBmb3IgUmVuZGVyZXIgcHJvY2Vzcy5cbiAgICAvLyBJZiB5b3Ugd2FudCB1c2UgTm9kZS5qcyBpbiBSZW5kZXJlciBwcm9jZXNzLCB0aGUgYG5vZGVJbnRlZ3JhdGlvbmAgbmVlZHMgdG8gYmUgZW5hYmxlZCBpbiB0aGUgTWFpbiBwcm9jZXNzLlxuICAgIC8vIFNlZSBcdUQ4M0RcdURDNDkgaHR0cHM6Ly9naXRodWIuY29tL2VsZWN0cm9uLXZpdGUvdml0ZS1wbHVnaW4tZWxlY3Ryb24tcmVuZGVyZXJcbiAgICByZW5kZXJlcjpcbiAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAndGVzdCdcbiAgICAgICAgPyAvLyBodHRwczovL2dpdGh1Yi5jb20vZWxlY3Ryb24tdml0ZS92aXRlLXBsdWdpbi1lbGVjdHJvbi1yZW5kZXJlci9pc3N1ZXMvNzgjaXNzdWVjb21tZW50LTIwNTM2MDA4MDhcbiAgICAgICAgICB1bmRlZmluZWRcbiAgICAgICAgOiB7fSxcbiAgfTtcbiAgY29uc3QgcmVzdWx0OiBVc2VyQ29uZmlnID0ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIC4uLmdldENvbW1vblZpdGVQbHVnaW5zKHsgcGFja2FnZUpTT04gfSksXG4gICAgICBjcmVhdGVIdG1sUGx1Z2luKHtcbiAgICAgICAgcGFnZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBmaWxlbmFtZTogJ2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICdpbmRleC5odG1sJyxcbiAgICAgICAgICAgIGluamVjdE9wdGlvbnM6IHtcbiAgICAgICAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgICAgIHRpdGxlOiBwYWNrYWdlSlNPTi5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0pLFxuICAgICAgKGVsZWN0cm9uIGFzIGFueSkoZWxlY3Ryb25PcHRpb25zKSxcbiAgICBdLFxuICAgIGNzczoge1xuICAgICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xuICAgICAgICBzY3NzOiB7XG4gICAgICAgICAgYWRkaXRpb25hbERhdGE6IGBcbiAgICAgICAgICAgIEB1c2UgXCJAdGstY3Jhd2xlci9zdHlsZXMvbWl4aW5zLnNjc3NcIiBhcyAqO1xuICAgICAgICAgIGAsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgcG9zdGNzczogZ2V0Q29tbW9uUG9zdGNzc0NvbmZpZygpLFxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG1pbmlmeTogaXNQcm9kdWN0aW9uID8gJ3RlcnNlcicgOiBmYWxzZSxcbiAgICAgIG91dERpcjogJ2Rpc3QnLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBleHRlcm5hbCxcbiAgICAgICAgaW5wdXQ6IHtcbiAgICAgICAgICBtYWluOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHRlcnNlck9wdGlvbnM6IENvbW1vblRlcnNlck9wdGlvbnMsXG4gICAgICB0YXJnZXQ6ICdlczIwMTUnLFxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcbiAgICB9LFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzLFxuICAgIH0sXG4gICAgLi4uZW52Q29uZmlnLFxuICB9O1xuICByZXR1cm4gcmVzdWx0O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBRUEsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sYUFBYTtBQUNwQjtBQUFBLEVBQ0U7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLE9BQ0s7QUFDUCxTQUFTLDZCQUE2QjtBQUN0QyxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGNBQWM7QUFDckIsU0FBUyx3QkFBd0I7QUFiakMsSUFBTSxtQ0FBbUM7QUFBa0ssSUFBTSwyQ0FBMkM7QUFnQjVQLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sZUFBZSxTQUFTO0FBQzlCLFFBQU0sY0FBYyxLQUFLO0FBQUEsSUFDdkIsYUFBYSxJQUFJLElBQUksa0JBQWtCLHdDQUFlLEdBQUcsTUFBTTtBQUFBLEVBQ2pFO0FBQ0EsUUFBTSxXQUFXO0FBQUEsSUFDZixHQUFHLE9BQU8sS0FBSyxZQUFZLGdCQUFnQixDQUFDLENBQUM7QUFBQSxJQUM3QyxHQUFHLE9BQU8sS0FBSyxZQUFZLG9CQUFvQixDQUFDLENBQUM7QUFBQSxFQUNuRDtBQUNBLFFBQU0sUUFBc0Isc0JBQXNCLFlBQVk7QUFDOUQsUUFBTSxZQUFZO0FBQUEsSUFDaEIsUUFBUSxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBO0FBQUEsSUFDdkMsV0FBVyxDQUFDLFNBQVM7QUFBQTtBQUFBLEVBQ3ZCO0FBRUEsUUFBTSxrQkFBeUM7QUFBQSxJQUM3QyxNQUFNO0FBQUE7QUFBQSxNQUVKLE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQTtBQUFBLFFBRUosU0FBUztBQUFBLFVBQ1A7QUFBQSxRQUNGO0FBQUEsUUFDQSxPQUFPO0FBQUEsVUFDTCxRQUFRLGVBQWUsV0FBVztBQUFBLFVBQ2xDLGVBQWU7QUFBQSxZQUNiO0FBQUEsVUFDRjtBQUFBLFVBQ0EsZUFBZTtBQUFBLFVBQ2YsV0FBVztBQUFBLFFBQ2I7QUFBQSxRQUNBLEdBQUc7QUFBQSxNQUNMO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBO0FBQUE7QUFBQSxNQUdQLE9BQU8sS0FBSyxLQUFLLGtDQUFXLHFCQUFxQjtBQUFBLElBQ25EO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFJQSxVQUNFLFFBQVEsSUFBSSxhQUFhO0FBQUE7QUFBQSxNQUVyQjtBQUFBLFFBQ0EsQ0FBQztBQUFBLEVBQ1Q7QUFDQSxRQUFNLFNBQXFCO0FBQUEsSUFDekIsU0FBUztBQUFBLE1BQ1AsR0FBRyxxQkFBcUIsRUFBRSxZQUFZLENBQUM7QUFBQSxNQUN2QyxpQkFBaUI7QUFBQSxRQUNmLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxVQUFVO0FBQUEsWUFDVixVQUFVO0FBQUEsWUFDVixlQUFlO0FBQUEsY0FDYixNQUFNO0FBQUEsZ0JBQ0osT0FBTyxZQUFZO0FBQUEsY0FDckI7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGLENBQUM7QUFBQSxNQUNBLFNBQWlCLGVBQWU7QUFBQSxJQUNuQztBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gscUJBQXFCO0FBQUEsUUFDbkIsTUFBTTtBQUFBLFVBQ0osZ0JBQWdCO0FBQUE7QUFBQTtBQUFBLFFBR2xCO0FBQUEsTUFDRjtBQUFBLE1BQ0EsU0FBUyx1QkFBdUI7QUFBQSxJQUNsQztBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUSxlQUFlLFdBQVc7QUFBQSxNQUNsQyxRQUFRO0FBQUEsTUFDUixlQUFlO0FBQUEsUUFDYjtBQUFBLFFBQ0EsT0FBTztBQUFBLFVBQ0wsTUFBTSxLQUFLLFFBQVEsa0NBQVcsWUFBWTtBQUFBLFFBQzVDO0FBQUEsTUFDRjtBQUFBLE1BQ0EsZUFBZTtBQUFBLE1BQ2YsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLElBQ2I7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQO0FBQUEsSUFDRjtBQUFBLElBQ0EsR0FBRztBQUFBLEVBQ0w7QUFDQSxTQUFPO0FBQ1QsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
