/*
 * Copyright (c) 2010-2019 SAP and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *   SAP - initial API and implementation
 */
angular.module('deployer', []);
angular.module('deployer')
.controller('DeployController', function ($scope, $http) {

	var defaultDirigibleInstances = [{
		'id': 1,
		'name': 'Local',
		'host': 'http://localhost:8080',
		'displayName': 'Local (http://localhost:8080)'
	}, {
		'id': 2,
		'name': 'Trial',
		'host': 'https://trial.ingress.pro.promart.shoot.canary.k8s-hana.ondemand.com',
		'displayName': 'Trial'
	}, {
		'id': 2,
		'name': 'Trial (Eclipse)',
		'host': 'http://dirigible.eclipse.org',
		'displayName': 'Trial (Eclipse)'
	}];

	function setDefaultDirigibleInstnaces() {
		var dirigibleInstnaces = getDirigibleInstances();
		if (dirigibleInstnaces.length === 0) {
			for (var i = 0; i < defaultDirigibleInstances.length; i++) {
				addDirigibleInstance(defaultDirigibleInstances[i]);
			}
		}
	}
	setDefaultDirigibleInstnaces();

	$scope.queryParams = getQueryParams();
	$scope.env = getEnvParams();
	$scope.dirigibleInstances = getDirigibleInstances();

	function getEnvParams() {
		var env = [];
		$scope.envParamsProvided = Boolean($scope.queryParams.env);
		if ($scope.envParamsProvided) {
			var envKeys = $scope.queryParams.env.split(",");
			for (var i = 0; i < envKeys.length; i ++) {
				env.push({
					key: envKeys[i]
				});
			}
		}
		return env;
	}

	function getDirigibleInstances() {
		var dirigibleInstances = JSON.parse(window.localStorage.getItem('DIRIGIBLE.instances'));
		return dirigibleInstances !== null ? dirigibleInstances : [];
	}

	function addDirigibleInstance(instance) {
		var dirigibleInstances = getDirigibleInstances();
		dirigibleInstances.push(instance);
		window.localStorage.setItem('DIRIGIBLE.instances', JSON.stringify(dirigibleInstances));
	}

	function getQueryParams () {
		var result = {};
		$scope.queryParamsProvided = false;
		if (window.location.search.length > 0) {
			var queryParams = window.location.search.slice(1).split('&');
			for (var i = 0 ; i < queryParams.length; i ++) {
				var pair = queryParams[i].split('=');
				result[pair[0]] = pair[1];
			}
		}

		var respositoryFound = false;
		var uriFound = false;
		for (var next in result) {
			if (next === 'repository') {
				respositoryFound = true;
			} else if (next === 'uri') {
				uriFound = true;
			}
		}
		$scope.queryParamsProvided = respositoryFound && uriFound;
		return result;
	}

	$scope.run = function() {
		window.location.href = getDeployUrl($scope.selectedDirigibleInstance);
	};

	function getDeployUrl(instance) {
		var url = instance.host + '/services/v3/web/ide-git/index.html?repository=' + $scope.queryParams.repository;
		if ($scope.queryParams.uri) {
			url += '&uri=' + $scope.queryParams.uri;
		}
		if ($scope.env && $scope.env.length > 0) {
			url += "&env=" + encodeURIComponent(JSON.stringify($scope.env));
		}
		return  url;
	}
});
