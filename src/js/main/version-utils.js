export default class VersionUtils {
  /**
   * Getting version from application data (projects and causal models).
   * Supporting the case when `data` is null or undefined
   * @param {*} data Object that has version property
   * @returns {number} Version number or -1 if the version is not defined
   */
  static getVersion(data) {
    if (data && data.version) {
      return Number(data.version);
    } else {
      return 0;
    }
  }
}
