<?php

/**
 * Magento
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade Magento to newer
 * versions in the future. If you wish to customize Magento for your
 * needs please refer to http://www.magentocommerce.com for more information.
 *
 * @category    BluePay
 * @package     BluePay_Echeck
 * @copyright   Copyright (c) 2010 BluePay Processing, LLC (http://www.bluepay.com)
 * @license     http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */


class BluePay_Echeck_Block_Info_Echeck extends Mage_Payment_Block_Info
{

    protected function _construct()
    {
        parent::_construct();

        $this->setTemplate('payment/info/echeck.phtml');
    }

    public function getAccountTypeName()
    {
        $types = Mage::getSingleton('echeck/config')->getAccountTypes();
        if (isset($types[$this->getInfo()->getAccountType()])) {
            return $types[$this->getInfo()->getAccountType()];
        }
        return $this->getInfo()->getAccountType();
    }

    public function toPdf()
    {

        $this->setTemplate('payment/info/pdf/echeck.phtml');
        return $this->toHtml();
    }
    
    public function getInfo()
    {
    	$info = Mage::getSingleton('checkout/session')->getQuote()->getPayment();
    	$this->unmapData($info);   	  	
		
    	if (!strlen($info->getMethod())) {
    		$this->unmapData($this->getData('info'));
            return $this->getData('info');
        }
        return $info;
    }
    
	public function unmapData($info)
    {
        $info->setEcheckRoutingNumber($info->getCcLast4())
            ->setEcheckBankName($info->getCcNumberEnc())
            ->setEcheckAccountType($info->getCcType())
            ->setEcheckAccountName($info->getCcOwner())
            ->setEcheckBankAcctNum($info->getCcSsIssue())
            ->setEcheckBankAcctNum4($info->getCcSsOwner());
        if(strlen($info->getEcheckBankAcctNum()))
        {
        	$info->setEcheckBankAcctNum4(substr($info->getEcheckBankAcctNum(), -4));
        }
    }
}
