/*
@Api_Name : /SaveAppUserSTSRole,
@Description: To save asigned and unassigned system
*/

// Require dependencies
var node_modules = '../../../../node_modules/'
var referenceRoot = '../../../../torus-references'
var reqExpress = require(node_modules + 'express')
var router = reqExpress.Router()
var reqLogInfo = require('../../../../torus-references/log/trace/LogInfo');
var reqLinq = require(node_modules + 'node-linq').LINQ;
var async = require(node_modules + 'async');
var reqFXDBInstance = require('../../../../torus-references/instance/DBInstance');
var reqInstanceHelper = require('../../../../torus-references/common/InstanceHelper');
var reqDateFormater = require('../../../../torus-references/common/dateconverter/DateFormatter');
const { resolve } = require('path');
const { reject } = require('lodash');
var strServiceName = 'SaveAppUserSTSRole';
// Host the SaveAppUserSTSRole api
router.post('/SaveAppUserSTSRole', function (appRequest, appResponse, next) {
    var objLogInfo = '';

    try {
        reqLogInfo.AssignLogInfoDetail(appRequest, function (objLogInfo, objSessionInfo) {
            var mHeaders = appRequest.headers;
            var U_ID = objSessionInfo.U_ID;

            reqFXDBInstance.GetFXDBConnection(mHeaders, 'clt_cas', objLogInfo, async function CallbackGetCassandraConn(pCltClient) {
                var mClient = pCltClient;
                // Initialize local variables  
                var strAppuId = appRequest.body.PARAMS.APPU_ID;
                var strUId = U_ID;
                var strAppstsId = appRequest.body.PARAMS.APPSTS_ID ? appRequest.body.PARAMS.APPSTS_ID : "";
                var arrASTSID = [];
                arrASTSID = strAppstsId != "" ? strAppstsId.split(',') : [];
                var appuserstsID = '';
                var strClientid = objSessionInfo.CLIENT_ID;
                var strTenantId = objSessionInfo.TENANT_ID;
                var makerChekerModel = 'N';
                // Delete all assigned Systems 
                await needMakerChecker();
                var AppuSTSableName = '';
                if (makerChekerModel == 'Y') {
                    reqInstanceHelper.PrintInfo(strServiceName, 'Deleting' + AppuSTSableName + 'table', objLogInfo);
                    AppuSTSableName = 'iv_app_user_sts';
                } else {
                    AppuSTSableName = 'app_user_sts';
                }
                delAppUserSTS();

                function delAppUserSTS() {
                    reqInstanceHelper.PrintInfo(strServiceName, 'Deleting' + AppuSTSableName + 'table', objLogInfo);
                    reqFXDBInstance.DeleteFXDB(mClient, AppuSTSableName, { 'appu_id': strAppuId }, objLogInfo, async function callbacksave(err, res) {
                        try {
                            if (err) {
                                return reqInstanceHelper.SendResponse(strServiceName, appResponse, '', objLogInfo, 'ERR-MIN-51457', 'Exception Occured while deleting appusersts function', err, '', '');
                            } else {
                                // Insert Already Assigned and New Assigning systems for every assign
                                for (var i = 0; i < arrASTSID.length; i++) {
                                    await updateFX_total_items();
                                    var ivappusersts = await getFX_total_items();
                                    let appUserStatus = await insertappusts(ivappusersts, arrASTSID[i]);

                                    // need to be insert ACTION_DESC only one time, no need to  run each and every appusts insert  
                                    if (i == 0 && appUserStatus == "SUCCESS")
                                        await updateActionDesc();
                                }

                                reqInstanceHelper.PrintInfo(strServiceName, 'Syatem Assigned/Unassigned successfully', objLogInfo);
                                reqInstanceHelper.SendResponse(strServiceName, appResponse, 'SUCCESS', objLogInfo, '', '', '', 'SUCCESS', '');
                            }

                        } catch (error) {
                            return reqInstanceHelper.SendResponse(strServiceName, appResponse, '', objLogInfo, 'ERR-MIN-51457', 'Exception Occured while executing saveAppUserSTS function ', error, '', '');
                        }

                    })
                }

                function updateFX_total_items() {
                    return new Promise((resolve, reject) => {
                        try {
                            var code = 'APP_USER_STS'
                            var selectquery = {
                                query: `update fx_total_items set counter_value = counter_value + 1 where code=?`,
                                params: [code]
                            }
                            reqInstanceHelper.PrintInfo(strServiceName, 'Updating fx_total_items table', objLogInfo);
                            reqFXDBInstance.ExecuteSQLQueryWithParams(mClient, selectquery, objLogInfo, function (pResult, pError) {
                                if (pError) {
                                    reject(pError)
                                } else {
                                    resolve('SUCCESS')
                                }
                            })
                        } catch (error) {
                            return reqInstanceHelper.SendResponse(strServiceName, appResponse, '', objLogInfo, 'ERR-MIN-51457', 'Exception Occured while executing  appusersts table insert process ', error, '', '');
                        }
                    })
                }

                function getFX_total_items() {
                    return new Promise((resolve, reject) => {
                        try {
                            var squery = {
                                query: `select counter_value from fx_total_items where code = ?`,
                                params: ['APP_USER_STS']
                            }
                            reqInstanceHelper.PrintInfo(strServiceName, 'Querying fx_total_items table', objLogInfo);
                            reqFXDBInstance.ExecuteSQLQueryWithParams(mClient, squery, objLogInfo, function (Result, Error) {
                                if (Error) {
                                    reject(Error);
                                } else {
                                    var appustsID = Result.rows[0].counter_value;
                                    resolve(appustsID);
                                }
                            })
                        } catch (error) {
                            return reqInstanceHelper.SendResponse(strServiceName, appResponse, '', objLogInfo, 'ERR-MIN-51457', 'Exception Occured while executing  appusersts table insert process ', error, '', '');
                        }
                    })
                }

                function insertappusts(appuserstsID, appstsId) {
                    return new Promise((resolve, reject) => {
                        try {
                            reqInstanceHelper.PrintInfo(strServiceName, 'Inserting' + AppuSTSableName + ' table', objLogInfo);
                            reqFXDBInstance.InsertFXDB(mClient, AppuSTSableName, [{
                                'appu_id': strAppuId,
                                'appusts_id': appuserstsID,
                                'appsts_id': appstsId,
                                'created_by': strUId,
                                'created_date': reqDateFormater.GetTenantCurrentDateTime(mHeaders, objLogInfo)
                            }], objLogInfo, function (error, result) {
                                if (result) {
                                    // if (makerChekerModel == 'Y') {
                                    //     var squery = `update users set action_desc = 'MODIFY_REQUEST' where u_id in
                                    //     (select u_id from app_users where appu_id = '${strAppuId}' and app_id = '${objLogInfo.APP_ID}')`
                                    //     reqFXDBInstance.ExecuteQuery(mClient, squery, objLogInfo, function (Error, Result) {
                                    //         if (Error) {
                                    //             reqInstanceHelper.PrintInfo(strServiceName, 'Update Query Executing on users table... ', objLogInfo);
                                    //             reject(Error);
                                    //         } else {
                                    //             resolve("SUCCESS");
                                    //         }
                                    //     })
                                    // }
                                    resolve("SUCCESS");
                                }
                                else {
                                    reject(error)
                                }
                            })
                        } catch (error) {
                            return reqInstanceHelper.SendResponse(strServiceName, appResponse, '', objLogInfo, 'ERR-MIN-51457', 'Exception Occured while executing  appusersts table insert process ', error, '', '');
                        }
                    })
                }

                function updateActionDesc() {
                    return new Promise((resolve, reject) => {
                        if (makerChekerModel == 'Y') {
                            var squery = `update users set action_desc = 'MODIFY_REQUEST' where u_id in
        (select u_id from app_users where appu_id = '${strAppuId}' and app_id = '${objLogInfo.APP_ID}')`
                            reqFXDBInstance.ExecuteQuery(mClient, squery, objLogInfo, function (Error, Result) {
                                if (Error) {
                                    reqInstanceHelper.PrintInfo(strServiceName, 'Update Query Executing on users table... ', objLogInfo);
                                    reject(Error);
                                } else {
                                    resolve("SUCCESS");
                                }
                            })
                        }
                    })
                }

                function needMakerChecker() {
                    return new Promise((resolve, reject) => {
                        try {
                            var condParams = {
                                tenant_id: strTenantId,
                                client_id: strClientid,
                                category: 'NEW_USER_CREATION'
                            };
                            reqFXDBInstance.GetTableFromFXDB(mClient, 'tenant_setup', [], condParams, objLogInfo, function (error, result) {
                                if (error) {
                                    reqInstanceHelper.PrintError(strServiceName, objLogInfo, 'ERR-SAS-0001', 'While Query Excecuting Error', error);
                                    resolve("FAILURE");
                                } else {
                                    if (result.rows.length) {
                                        let needMakerChekerModel = JSON.parse(result.rows[0].setup_json)
                                        makerChekerModel = needMakerChekerModel.NEED_MAKER_CHECKER_MODEL
                                    }
                                    resolve("SUCCESS");
                                }
                            })
                        } catch (error) {
                            reqInstanceHelper.PrintError(strServiceName, objLogInfo, 'ERR-SAS-0002', 'While Query Excecuting Error', error);
                        }
                    })
                }

            })
        })
    } catch (error) {
        return reqInstanceHelper.SendResponse(strServiceName, appResponse, '', objLogInfo, 'ERR-MIN-51457', 'Exception Occured while executing  SaveAppUserSTSRole function ', error, '', '');
    }
});
module.exports = router;